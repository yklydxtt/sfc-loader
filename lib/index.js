const compiler = require('vue-template-compiler');
const { parse }= require("@babel/parser");
const  generate=require("babel-generator").default;
const {initProps,initData,initComputed}=require('./init');
const { parseName}=require('./utils');

const state = {
    name: undefined,
    data: {},
    props: {},
    computeds: {},
    components: {}
};

function formatContent(source){
    const res=compiler.parseComponent(source,{pad:'line'});
    return {
        template: res.template.content.replace(/{{/g, '{').replace(/}}/g, '}'),
        js: res.script.content.replace(/\/\//g, '')
    }
}

module.exports=function transform(source){
    const component=formatContent(source.toString());
    const vast=parse(component.js,{sourceType:'module'});
    initProps(vast,state);
    initData(vast, state);
    initComputed(vast, state);
    // initComponents(vast, state); 

    // AST for react component
    const tpl = `export default function ${parseName(state.name)}(props) {}`;
    const rast=parse(tpl,{sourceType:'module'});
    const {code}=generate(rast,{
        quotes: 'single',
    });
    console.log(JSON.stringify(state));
    return code;
}