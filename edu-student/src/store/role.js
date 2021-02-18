import http from "../utils/http.js"

export default {
        namespaced:true,
        state:{
                list:[],
                isInit:false,
        },
        mutations:{
                _init( state,list ){
                        state.list = list;
                        state.isInit = true;
                },
                _addRole( state,role ){
                        state.list.push( role )
                },
                _updateRole( state,role ){
                        let i = state.list.findIndex( item => item.role_id === role.role_id );
                        state.list.splice(i,1,role )
                }
        },
        actions:{
                async init( context ){
                        if( context.state.isInit  ) return;
                        let list = await http({ url:"/role/all" });
                        context.commit( "_init", list)
                },
                async addRole ( context,role ){
                        console.log(role.role_name)
                        role.role_id = await http({ url:"/role/add",method:"post",data:{role_name:role.role_name }});
                        context.commit( "_addRole",role )
                },
                async updateRole( context,role ){
                        await http({ url:"/role/update",method:"post",data:role });
                        context.commit( "_updateRole",role )

                }
        },
        getters:{}
};