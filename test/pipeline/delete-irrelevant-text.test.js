const { deleteIrrelevantText } = require('../../src/pipeline/delete-irrelevant-text')

describe('delete-irrelevant-text', () => {
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
    const result = deleteIrrelevantText(text)
    expect(result).toEqual(`
      Lorem ipsum dolor.
      foo bar com.example.BazException: Unsupported IUZR
          at foo
          at bar
          at baz
      Dolor sit amet.
    `)
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
    const result = deleteIrrelevantText(text)
    expect(result).toEqual(`
      Lorem ipsum dolor.
      foo bar com.example.BazException: Unsupported IUZR
          at foo
      AND NOW FOR SOMETHING COMPLETELY DIFFERENT
          at bar
          at java.base/jdk.internal.reflect.NativeMethodAccessorImpl.invoke0(Native Method)
      Dolor sit amet.
    `)
  })

  it('should stop after maximum stack length', async () => {
    const text = `
      Lorem ipsum dolor.
      foo bar com.example.BazException: Unsupported IUZR
          at foo
          at com.sun.proxy.$Proxy0.foo(Unknown Source)
          at bar
          at baz
          at qux
          at quux
          at corge
          at grault
          at garply
          at waldo
          at fred
          at plugh
          at xyzzy
      Dolor sit amet.
    `
    const result = deleteIrrelevantText(text)
    expect(result).toEqual(`
      Lorem ipsum dolor.
      foo bar com.example.BazException: Unsupported IUZR
          at foo
          at bar
          at baz
          at qux
          at quux
          at corge
          at grault
          at garply
          at waldo
      Dolor sit amet.
    `)
  })
})
