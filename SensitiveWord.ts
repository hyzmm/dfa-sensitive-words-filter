export default class SensitiveWord
{
    private tree: any;

    public setFilterWord(words: string[]): void
    {
        this.tree = Object.create(null);

        for (let word of words)
            this.addSensitiveWord(word);

        // console.log(JSON.stringify(this.tree, null, '\t'));
    }

    public detectSensitiveWords(content: string): boolean
    {
        let node: any = this.tree;

        for (let c of content)
        {
            if (c in node)
            {
                node = node[c];

                if (node.ended)
                    return true;
            }
            else
            {
                node = this.tree;
            }
        }

        return false;
    }

    public replaceSensitiveWords(sentence: string, fillChar: string = "*"): string
    {
        let returnValue: string = "";
        let fillChars  : string = "";
        let filteredChars: string = "";

        let node: any = this.tree;

        for (let c of sentence)
        {
            filteredChars += c;

            if (c in node)
            {
                node = node[c];

                // 如果这个字符在敏感词节点中，则转换成隐藏字符
                fillChars += fillChar;

                if (node.ended)
                {
                    // 如果这个词构成敏感词，把隐藏字加入结果
                    returnValue += fillChars;

                    // 一次敏感词匹配完成完成。重置，准备下次敏感词匹配
                    fillChars = "";
                    filteredChars = "";
                }
            }
            else
            {
                node = this.tree;

                // 如果这个字符不属于敏感词节点中，允许该字符
                returnValue += filteredChars;

                // 不构成完成敏感词，一次敏感词匹配完成完成。重置，准备下次敏感词匹配
                fillChars = "";
                filteredChars = "";
            }
        }

        // 句子匹配完成，如果完成匹配
        // - 如果仅仅是敏感词中的几个字符，不构成敏感词，filteredChars将会是源字符串
        // - 如果不是敏感词，filteredChars会是空，因为在上面else中被加入returnValue
        returnValue += filteredChars;

        return returnValue;
    }

    private addSensitiveWord(word: String): void
    {
        let node: any = this.tree;

        let char;
        let length: number = word.length;

        for (let i: number = 0; i < length; i++)
        {
            char = word[ i ];

            if (char in node)
            {
                node = node[ char ];
            }
            else
            {
                const newNode: any = {};
                node[ char ] = newNode;

                node = newNode;
            }

            node.ended = i === length - 1;
        }
    }
}
