/* tslint:disable:member-access */
import { ok, strictEqual } from "assert";
import { readFileSync } from "fs";
import { suite, test } from "mocha-typescript";
import { join } from "path";
import SensitiveWord from "../src/SensitiveWord";

@suite
class SensitiveWordTest {
    static sw: SensitiveWord;

    static before() {
        SensitiveWordTest.sw = new SensitiveWord();
        const words: string[] = readFileSync(
            join(__dirname, "../test/sensitive_words")
        )
            .toString()
            .split("\n");
        SensitiveWordTest.sw.setFilterWord(words);
    }

    @test
    testMatch() {
        ok(SensitiveWordTest.sw.detectSensitiveWords("加微信"));
        ok(SensitiveWordTest.sw.detectSensitiveWords("+微信"));
        ok(SensitiveWordTest.sw.detectSensitiveWords("日了"));
        ok(SensitiveWordTest.sw.detectSensitiveWords("fuck"));
    }

    @test
    testMismatch() {
        ok(!SensitiveWordTest.sw.detectSensitiveWords("日"));
        ok(!SensitiveWordTest.sw.detectSensitiveWords("fuc"));
    }

    @test
    testContains() {
        ok(SensitiveWordTest.sw.detectSensitiveWords("我日了狗"));
        ok(SensitiveWordTest.sw.detectSensitiveWords("我日了 狗"));
        ok(SensitiveWordTest.sw.detectSensitiveWords("我真是日了狗了"));
        ok(SensitiveWordTest.sw.detectSensitiveWords("I fuckyou"));
        ok(SensitiveWordTest.sw.detectSensitiveWords("I fuck you"));
        ok(SensitiveWordTest.sw.detectSensitiveWords("I really fuck you"));
    }

    @test
    testReplaceMatch() {
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("微信号+毛泽东"),
            "**号+***"
        );
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("我有毛泽东的微信号了"),
            "我有***的**号了"
        );
        strictEqual(SensitiveWordTest.sw.replaceSensitiveWords("日了"), "**");
        strictEqual(SensitiveWordTest.sw.replaceSensitiveWords("fuck"), "****");
    }

    @test
    testIgnoreMismatch() {
        strictEqual(SensitiveWordTest.sw.replaceSensitiveWords("日"), "日");
        strictEqual(SensitiveWordTest.sw.replaceSensitiveWords("fuc"), "fuc");
    }

    @test
    testReplaceContains() {
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("我日了狗"),
            "我**狗"
        );
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("我日了 狗"),
            "我** 狗"
        );
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("我正是日了狗了"),
            "我正是**狗了"
        );
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("I fuckyou"),
            "I ****you"
        );
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("I fuck you"),
            "I **** you"
        );
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("I really fuck you"),
            "I really **** you"
        );
    }

    @test
    testComplexSentence() {
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("我日fuck"),
            "我日****"
        );
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("日了fuck"),
            "******"
        );
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords(
                "我日，真的是日了，fuck you"
            ),
            "我日，真的是**，**** you"
        );
    }

    @test
    testReplaceWithCustomizedChar() {
        strictEqual(
            SensitiveWordTest.sw.replaceSensitiveWords("fuck", "-"),
            "----"
        );
    }
}
