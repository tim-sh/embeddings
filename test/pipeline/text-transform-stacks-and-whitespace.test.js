const { textTransformStacksAndWhitespace } = require('../../src/pipeline/text-transform-stacks-and-whitespace')

describe('text-transform-stacks-and-whitespace', () => {
  it('should handle Java stacks', async () => {
    const text = `
      Lorem ipsum dolor.
      foo bar com.example.BazException: Unsupported IUZR
          at foo
          at bar
          at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
          at sun.reflect.NativeMethodAccessorImpl.invoke(NativeMethodAccessorImpl.java:62)
          at com.sun.proxy.$Proxy0.foo(Unknown Source)
          at jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
          at baz
      Dolor sit amet.
    `
    const result = textTransformStacksAndWhitespace(text)
    expect(result).toEqual(`Lorem ipsum dolor.
foo bar com.example.BazException: Unsupported IUZR
at foo
at bar
at baz
Dolor sit amet.`)
  })

  describe('should handle Node.js stacks', () => {
    it('with cause and ellipses', async () => {
      const text = `
        Error: e
        at Object.<anonymous> (/path/to/script.js:2:7)
        at Module._compile (node:internal/modules/cjs/loader:1469:14)
        ... 4 lines matching cause stack trace ...
        at node:internal/main/run_main_module:28:49 {
          [cause]: Error: cause
          at Object.<anonymous> (/path/to/script.js:1:3)
          at Module._compile (node:internal/modules/cjs/loader:1469:14)
          at Module._extensions..js (node:internal/modules/cjs/loader:1548:10)
          at Module.load (node:internal/modules/cjs/loader:1288:32)
          at Module._load (node:internal/modules/cjs/loader:1104:12)
          at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:174:12)
          at node:internal/main/run_main_module:28:49
      `
      const result = textTransformStacksAndWhitespace(text)
      expect(result).toEqual(`Error: e
at Object.<anonymous> (/path/to/script.js:2:7)
[cause]: Error: cause
at Object.<anonymous> (/path/to/script.js:1:3)`)
    })

    it('with subsequent too-long stack traces', async () => {
      const text = `
        Error: e
        at Object.<anonymous> (/path/to/script.js:2:7)
        at Module._compile (node:internal/modules/cjs/loader:1469:14)
        at foo
        at bar
        at baz
        at Module._compile (node:internal/modules/cjs/loader:42)
        at qux
        at quux
        at corge
        at grault
        at garply
        at cognito
        at grault
        at node:internal/main/run_main_module:28:49 {
          [cause]: Error: cause
          at Object.<anonymous> (/path/to/script.js:2:7)
          at Module._compile (node:internal/modules/cjs/loader:1469:14)
          at bam
          at Module._compile (node:internal/modules/cjs/loader:42)
          at garply
          at cognito
          at grault
          at quux
          at main
          at foo
          at bar
          at baz
      `
      const result = textTransformStacksAndWhitespace(text)
      expect(result).toEqual(`Error: e
at Object.<anonymous> (/path/to/script.js:2:7)
at foo
at bar
at baz
at qux
at quux
at corge
at grault
at garply
[cause]: Error: cause
at Object.<anonymous> (/path/to/script.js:2:7)
at bam
at garply
at cognito
at grault
at quux
at main
at foo
at bar`)
    })

    it('with properties', async () => {
      const text = `
        node:internal/modules/cjs/loader:1056
          throw err;
          ^
        
        Error: Cannot find module 'foo.js'
            at Module._resolveFilename (node:internal/modules/cjs/loader:1053:15)
            at bar
            at Module._load (node:internal/modules/cjs/loader:898:27)
            at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:84:12)
            at foo
            at bar
            at baz
            at qux
            at quux
            at corge
            at grault
            at garply
            at waldo
            at node:internal/main/run_main_module:23:47 {
          code: 'MODULE_NOT_FOUND',
          requireStack: []
        }
        foo node:internal
        bar
      `
      const result = textTransformStacksAndWhitespace(text)
      expect(result).toEqual(`Error: Cannot find module 'foo.js'
at bar
at foo
at bar
at baz
at qux
at quux
at corge
at grault
at garply
code: 'MODULE_NOT_FOUND',
requireStack: []
foo node:internal
bar`)
    })

  })


  it('should stop filtering at intermittent non-stackframes', async () => {
    const text = `
      Lorem ipsum dolor.
      foo bar com.example.BazException: Unsupported IUZR
          at foo
          at java.base/java.util.Optional.orElseThrow(Optional.java:403)
      AND NOW FOR SOMETHING COMPLETELY DIFFERENT
          at bar
          at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
      Dolor sit amet.
    `
    const result = textTransformStacksAndWhitespace(text)
    expect(result).toEqual(`Lorem ipsum dolor.
foo bar com.example.BazException: Unsupported IUZR
at foo
AND NOW FOR SOMETHING COMPLETELY DIFFERENT
at bar
Dolor sit amet.`)
  })

})
