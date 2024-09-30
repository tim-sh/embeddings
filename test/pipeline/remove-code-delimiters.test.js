const { removeCodeDelimiters } = require('../../src/pipeline/remove-code-delimiters')

describe('remove-code-delimiters', () => {

  describe('code fences', () => {

    describe('with language identifier', () => {
      it('should remove the fences', async () => {
        expect(removeCodeDelimiters(`
          A
          \`\`\`js
          const foo1 = 'bar'
          \`\`\`
          B
        `)).toEqual(`
          A
          const foo1 = 'bar'
          B
        `)

        expect(removeCodeDelimiters(`
          A
    \`\`\`js
          const foo2 = 'bar'
          \`\`\`
          B
        `)).toEqual(`
          A
          const foo2 = 'bar'
          B
        `)

        expect(removeCodeDelimiters(`
          A \`\`\`js
          const foo3 = 'bar'
          \`\`\`
          B
        `)).toEqual(`
          A
          const foo3 = 'bar'
          B
        `)

      })

    })

    describe('without language identifier', () => {
      it('should remove the fences', async () => {
        expect(removeCodeDelimiters(`
          A
    \`\`\`
          const foo2 = 'bar'
          \`\`\`
          B
        `)).toEqual(`
          A
          const foo2 = 'bar'
          B
        `)

        expect(removeCodeDelimiters(`
          A\`\`\`
          const foo3 = 'bar'
          \`\`\`
          B
        `)).toEqual(`
          A
          const foo3 = 'bar'
          B
        `)

        expect(removeCodeDelimiters(`
          A
          \`\`\`const foo4 = 'bar'
          \`\`\`
          B
        `)).toEqual(`
          A
          const foo4 = 'bar'
          B
        `)

        expect(removeCodeDelimiters(`
          A
          \`\`\`
          const foo5 = 'bar'\`\`\`
          B
        `)).toEqual(`
          A
          const foo5 = 'bar'
          B
        `)

        expect(removeCodeDelimiters(`
          A \`\`\`const foo7 = 'bar'\`\`\` B
        `)).toEqual(`
          A const foo7 = 'bar' B
        `)

        expect(removeCodeDelimiters(`
          A\`\`\` const foo8 = 'bar' \`\`\`B
        `)).toEqual(`
          A const foo8 = 'bar' B
        `)

      })

    })

  })

  describe('inline code', () => {

    it('should remove the fences', async () => {
      expect(removeCodeDelimiters(`
        A
      \`const foo1 = 'bar'\`
        B
      `)).toEqual(`
        A
      const foo1 = 'bar'
        B
      `)

      expect(removeCodeDelimiters(`
        A \`  const foo2 = 'bar' \`B
      `)).toEqual(`
        A   const foo2 = 'bar' B
      `)

    })


  })

})
