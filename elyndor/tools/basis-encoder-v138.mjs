import {WASI} from 'node:wasi';
import fs from 'node:fs';
const wasi=new WASI({version:'preview1',args:['basisu',...process.argv.slice(2)],preopens:{'.':process.cwd()},returnOnExit:true});
const module=await WebAssembly.compile(fs.readFileSync('output/hosting138/tools/basisu_st.wasm'));
const instance=await WebAssembly.instantiate(module,wasi.getImportObject());
process.exitCode=wasi.start(instance);
