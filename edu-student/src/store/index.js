//创建vuex对象并导出
import Vue from "vue";
import Vuex from "vuex";
import func from "./func.js";
import role from "./role.js";
import classroom from "./classroom.js";
import http from "../utils/http.js"
import dictionary from "./dictionary"


Vue.use(Vuex);

let store = new Vuex.Store({
        //拆分子仓库
        modules:{
                func,
                role,
                classroom,
                dictionary
        },
        //存放公用数据
        state:{ http },
        //当仓库中的state中的数据，多个组件在使用时都要经过一定处理计算才能用，可让仓库
        //在getters中算好后再让多个组件去用
        //getters相当于是仓库的计算属性
        getters:{},

        //vuex规定：只有mutations节点中的方法才可以修改state节点中保存的数据
        //vuex规定：mutations节点中的方法在调用时第一个参数总是state本身
        //vuex规定：mutations节点中的方法组件在调用时必须用commit（）来进行调用

        //vuex规定：mutations节点中的代码只能使同步的代码，不包含异步的耗时代码
        mutations:{},
        //vuex规定：actions节点中的方法可以包含异步耗时的代码，但绝对不可以修改state中的数据
        //vuex规定：actions节点中的方法在调用时第一个参数是一个仓库的上下文对象，里面的包的重要属性有：
        //state、commit
        //vuex规定：actions
        actions:{}

});

export default store;