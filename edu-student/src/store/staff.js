import http from "../utils/http.js";

export default {
        namespaced:true,
        state:{
                staff:[],
                isInit:false
        },
        mutations:{},
        actions:{
                async init(){
                        await http({ url:"/staff/listbycategory" })
                }
        },
        getters:{}
};