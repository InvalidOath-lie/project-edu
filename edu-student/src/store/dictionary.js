export default {
        namespaced:true,
        state:{
                dictionary:[],
                isInit:false
        },
        mutations:{
                _init( state,dictionary ){
                        state.dictionary = dictionary;
                        state.isInit=true;
                }
        },
        actions:{
                async init( { state,commit,rootState } ){
                        if( state.isInit ) return;
                        let dictionary = await rootState.http({ url:"/dictionary/all" });  //在总仓库导入http
                        commit( "_init",dictionary )
                }
        },
        getters:{
                //让计算属性返回一个函数，闭包
                getGroupByKey( state ){
                        return function( groupKey ){
                                return state.dictionary.filter( item => item.dic_group_key === groupKey )
                        }
                },
                staffCategory( state ){
                        return state.dictionary.filter( item => item.dic_group_key === 'staff_category' )
                }
        }
};