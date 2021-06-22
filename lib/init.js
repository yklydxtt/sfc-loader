const traverse = require("@babel/traverse").default;
const t=require('@babel/types');
const collectVueProps = require('./vue-props');

exports.initProps=function(ast,state){
    traverse(ast,{
        Program(path) {
            const nodeLists = path.node.body;
            let count = 0;
    
            for (let i = 0; i < nodeLists.length; i++) {
                const node = nodeLists[i];
                if (t.isExportDefaultDeclaration(node)) {
                    count++;
                }
            }
    
            if (count > 1 || !count) {
                const msg = !count ? 'Must hava one' : 'Only one';
                throw new Error(`${msg} export default declaration in youe vue component file`);
            }
        },
        ObjectProperty (path) {
            const parent = path.parentPath.parent;
            const name = path.node.key.name;
            if (parent && t.isExportDefaultDeclaration(parent)) {
                if (name === 'name') {
                    if (t.isStringLiteral(path.node.value)) {
                        state.name = path.node.value.value;
                    } else {
                        throw new Error(`The value of name prop should be a string literal.`);
                    }
                } else if (name === 'props') {
                    collectVueProps(path, state);
                    path.stop();
                }
            }
        }
    })
}

exports.initData = function initData (ast, state) {
    traverse(ast, {
        ObjectMethod (path) {
            const parent = path.parentPath.parent;
            const name = path.node.key.name;

            if (parent && t.isExportDefaultDeclaration(parent)) {
                if (name === 'data') {
                    const body = path.node.body.body;
                    state.data['_statements'] = [].concat(body);

                    let propNodes = {};
                    body.forEach(node => {
                        if (t.isReturnStatement(node)) {
                            propNodes = node.argument.properties;
                        }
                    });

                    propNodes.forEach(propNode => {
                        state.data[propNode.key.name] = propNode.value;
                    });
                    path.stop();
                }
            }
        }
    });
};

exports.initComputed = function initComputed (ast, state) {
    traverse(ast, {
        ObjectProperty (path) {
            const parent = path.parentPath.parent;
            const name = path.node.key.name;
            if (parent && t.isExportDefaultDeclaration(parent)) {
                if (name === 'computed') {
                    collectVueComputed(path, state);
                    path.stop();
                }
            }
        }
    });
};

exports.initComponents = function initComponents (ast, state) {
    traverse(ast, {
        ObjectProperty (path) {
            const parent = path.parentPath.parent;
            const name = path.node.key.name;
            if (parent && t.isExportDefaultDeclaration(parent)) {
                if (name === 'components') {
                    // collectVueComputed(path, state);
                    const props = path.node.value.properties;
                    props.forEach(prop => {
                        state.components[prop.key.name] = prop.value.name;
                    });
                    path.stop();
                }
            }
        }
    });
};