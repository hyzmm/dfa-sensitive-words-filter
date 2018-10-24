import * as assert from "assert";
import {readFileSync} from "fs";
import {join} from "path";
import SensitiveWord from "../SensitiveWord";

describe("All", () => {
    const sensitiveWord: SensitiveWord = new SensitiveWord();

    before(() => {
        const sensitiveWords: string[] = readFileSync(join(__dirname, "../test/sensitive_words"))
            .toString()
            .split("\n");
        sensitiveWord.setFilterWord(sensitiveWords);
    });

    describe("#detectSensitiveWords", () => {
        it("test match", () => {
            assert.ok(sensitiveWord.detectSensitiveWords("日了"));
            assert.ok(sensitiveWord.detectSensitiveWords("fuck"));
        });

        it("test not match", () => {
            assert.ok(!sensitiveWord.detectSensitiveWords("日"));
            assert.ok(!sensitiveWord.detectSensitiveWords("fuc"));
        });

        it("test contains", () => {
            assert.ok(sensitiveWord.detectSensitiveWords("我日了狗"));
            assert.ok(sensitiveWord.detectSensitiveWords("我日了 狗"));
            assert.ok(sensitiveWord.detectSensitiveWords("我真是日了狗了"));
            assert.ok(sensitiveWord.detectSensitiveWords("I fuckyou"));
            assert.ok(sensitiveWord.detectSensitiveWords("I fuck you"));
            assert.ok(sensitiveWord.detectSensitiveWords("I really fuck you"));
        });
    });

    describe("#replaceSensitiveWords", () => {
        it("test match", () => {
            // assert.equal(sensitiveWord.replaceSensitiveWords("微信号+毛泽东"), "*******");
            assert.equal(sensitiveWord.replaceSensitiveWords("微信号-毛泽东"), "***-***");
            assert.equal(sensitiveWord.replaceSensitiveWords("日了"), "**");
            assert.equal(sensitiveWord.replaceSensitiveWords("fuck"), "****");
        });

        it("test not match", () => {
            assert.equal(sensitiveWord.replaceSensitiveWords("日"), "日");
            assert.equal(sensitiveWord.replaceSensitiveWords("fuc"), "fuc");
        });

        it("test contains", () => {
            assert.equal(sensitiveWord.replaceSensitiveWords("我日了狗"), "我**狗");
            assert.equal(sensitiveWord.replaceSensitiveWords("我日了 狗"), "我** 狗");
            assert.equal(sensitiveWord.replaceSensitiveWords("我正是日了狗了"), "我正是**狗了");
            assert.equal(sensitiveWord.replaceSensitiveWords("I fuckyou"), "I ****you");
            assert.equal(sensitiveWord.replaceSensitiveWords("I fuck you"), "I **** you");
            assert.equal(
                sensitiveWord.replaceSensitiveWords("I really fuck you"),
                "I really **** you",
            );
        });

        it("test complex sentence", () => {
            assert.equal(sensitiveWord.replaceSensitiveWords("我日fuck"), "我日****");
            assert.equal(sensitiveWord.replaceSensitiveWords("日了fuck"), "******");
            assert.equal(
                sensitiveWord.replaceSensitiveWords("我日，真的是日了，fuck you"),
                "我日，真的是**，**** you",
            );
        });
    });

    describe("#replaceSensitiveWords with customized character", () => {
        it("test contains", () => {
            assert.equal(sensitiveWord.replaceSensitiveWords("fuck", "-"), "----");
        });
    });
});
