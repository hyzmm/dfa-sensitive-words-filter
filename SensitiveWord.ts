export default class SensitiveWord {
    private tree: any;

    public setFilterWord(words: string[]): void {
        // sort
        words.sort((a: string, b: string) => b.length - a.length);

        this.tree = Object.create(null);

        for (let word of words) this.addSensitiveWord(word);

        // console.log(JSON.stringify(this.tree, null, '\t'));
    }

    public detectSensitiveWords(content: string): boolean {
        let node: any = this.tree;

        for (let c of content) {
            if (c in node) {
                node = node[c];

                if (node.ended) return true;
            } else {
                node = this.tree;
            }
        }

        return false;
    }

    /**
     * 替换句子中的敏感字为指定字符
     * @param sentence
     * @param fillChar
     * @param global        外部调用始终为true，false则检查到敏感字后停止后续检查
     */
    public replaceSensitiveWords(sentence: string, fillChar: string = "*", global: boolean = true): string {
        let returnValue: string = "";
        let fillChars: string = "";
        let filteredChars: string = "";

        let node: any = this.tree;

        for (let i = 0, len = sentence.length; i < len; i++) {
            const c = sentence[i];

            // 以当前字符为起点，检查后续是否为敏感字
            // 有两个前提：
            // 1. 全局查找时，确保不会被多余的递归调用
            // 2. 当前节点不是敏感节点树根节点，即正在查找中，如果不在查找中，和后续流程做的事情重复了
            if (global && node != this.tree) {
                const sensitiveChars = this.replaceSensitiveWords(sentence.substring(i), fillChar, false);
                // 如果以当前字符为起始的句子属于敏感句，跳过这段
                if (sensitiveChars) {
                    // -1 是为了和 i++ 抵消
                    i += sensitiveChars.length - 1;
                    // 需要加上 filteredChars，因为之前的查找只是敏感句的一部分，未构成敏感句
                    returnValue += filteredChars + sensitiveChars;

                    // 一次敏感词匹配完成完成。重置，准备下次敏感词匹配
                    fillChars = "";
                    filteredChars = "";

                    continue;
                }
            }
            filteredChars += c;

            if (c in node) {
                node = node[c];

                // 如果这个字符在敏感词节点中，则转换成隐藏字符
                fillChars += fillChar;

                if (node.ended) {
                    // 如果这个词构成敏感词，把隐藏字加入结果
                    returnValue += fillChars;

                    // 一次敏感词匹配完成完成。重置，准备下次敏感词匹配
                    fillChars = "";
                    filteredChars = "";
                }
            } else {
                if (!global) return returnValue;

                // 如果这个字符不属于敏感词节点中，允许该字符
                returnValue += filteredChars;

                // 不构成完成敏感词，一次敏感词匹配完成完成。重置，准备下次敏感词匹配
                fillChars = "";
                filteredChars = "";

                node = this.tree;
            }
        }

        // 句子匹配完成，如果完成匹配
        // - 如果仅仅是敏感词中的几个字符，不构成敏感词，filteredChars将会是源字符串
        // - 如果不是敏感词，filteredChars会是空，因为在上面else中被加入returnValue
        returnValue += filteredChars;

        return returnValue;
    }

    private addSensitiveWord(word: string): void {
        let node: any = this.tree;

        let char;
        let length: number = word.length;

        for (let i: number = 0; i < length; i++) {
            char = word[i];

            if (char in node) {
                node = node[char];
            } else {
                const newNode: any = {};
                node[char] = newNode;

                node = newNode;
            }

            node.ended = i === length - 1;
        }
    }
}
