const {build} = require('esbuild')
const {dependencies, peerDependencies} = require('./package.json')
const { Generator } = require('npm-dts')

const shared = {
    entryPoints: ['lib/index.ts'],
    bundle: true,
    external: Object.keys(dependencies).concat(Object.keys(peerDependencies)),
    platform: 'node',
}

build({
    ...shared,
    outfile: 'dist/index.js',
})


new Generator({
    entry: 'src/index.ts',
    output: 'dist/index.d.ts',
}).generate()