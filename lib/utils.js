exports.parseName=function parseName(name){
    name=name||'my-react-component';
    const val=name.split('-');
    let str='';
    val.forEach(word=>{
        str+=word[0].toUpperCase()+word.slice(1);
    });
    return str;
}

exports.getIdentifier = function getIdentifier (state, key) {
    return state.data[key] ? t.identifier('state') : t.identifier('props');
};