interface INode {
    ended: boolean;
}

export default class SensitiveWord {
    private tree: INode;

    public setFilterWord(words: string[]): void {
        this.tree = Object.create(null);
        for (const word of words) {
            this.addSensitiveWord(word);
        }

        // console.log(JSON.stringify(this.tree, null, '\t'));
    }

    /**
     * 检查句子是否包含敏感字符
     *
     * @param content
     */
    public detectSensitiveWords(content: string): boolean {
        return !!this.exec(content);
    }

    /**
     * 替换句子中的敏感字为指定字符
     * @param sentence
     * @param fillChar
     * @param global        外部调用始终为true，false则检查到敏感字后停止后续检查
     */
    public replaceSensitiveWords(
        sentence: string,
        fillChar: string = "*",
        global: boolean = true
    ): string {
        let result;
        const chars = sentence.split("");
        // tslint:disable-next-line:no-conditional-assignment
        while ((result = this.exec(sentence, result ? result.end : 0))) {
            chars.fill(fillChar, result.beg, result.end);
        }
        return chars.join("");
    }

    /**
     * 添加一个敏感词
     *
     * @param word
     */
    public addSensitiveWord(word: string): void {
        let node: INode = this.tree;

        let char: string;
        const length = word.length;

        for (let i: number = 0; i < length; i++) {
            char = word[i];

            if (char in node) {
                node = node[char];
            } else {
                const newNode: INode = Object.create(null);
                node[char] = newNode;

                node = newNode;
            }

            node.ended = i === length - 1;
        }
    }

    private exec(toTest: string, startIndex = 0): { beg: number; end: number } {
        let node: INode = this.tree;
        let beg = startIndex; // 起始检查字符
        let end = startIndex; // 当前检查字符
        let char: string;

        const length: number = toTest.length;
        while (beg < length) {
            char = toTest[end];

            // 当前字符可能是敏感词
            if (node[char]) {
                node = node[char];
                end++;
                // 匹配到完整的敏感词
                if (node.ended) {
                    return { beg, end };
                }
            } else {
                // 继续下一个
                beg++;
                end = beg;
                node = this.tree;
            }
        }
        return null;
    }
}
