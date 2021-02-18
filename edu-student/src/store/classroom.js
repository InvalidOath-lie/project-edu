import http from "../utils/http.js"

export default{
        namespaced:true,
        state:{
                list:[],
                isInit:false
        },
        mutations:{
                _getClassroom( state,calsslist ){
                        state.list = calsslist;
                        state.isInit = true;
                },
                _addClassroom( state,classroom ){

                        state.list.push( classroom );
                },
                _removeClassroom( state,clsrid ){
                        let i = state.list.findIndex( item => item.clsr_id === clsrid );
                        state.list.splice(i,1)
                },
                _updateClassroom( state,room ){
                        let i = state.list.findIndex( item => item.clsr_id === room.clsr_id );
                        state.list.splice( i,1,room )
                }
        },
        actions:{
                async getClassroom( context ){
                        if( context.state.isInit ) return;
                        let list = await http({ url:"/classroom/all" });
                        context.commit( "_getClassroom",list )
                },
                async addClassroom( context,room ){
                        room.clsr_id = await http({ url:"/classroom/add",method:"post",data: room});
                        room.clsr_occupy = 0;
                        context.commit( "_addClassroom",room );
                },
                async removeClassroom( context,id ){
                        await http({ url:"/classroom/remove/" + id });
                        context.commit( "_removeClassroom",id );
                },
                async updateClassroom( context,room ){
                        console.log(room)
                        await http({ url:"classroom/update",method:"post",data:room });
                        context.commit( "_updateClassroom",room )
                }
        },
        getters:{}
};