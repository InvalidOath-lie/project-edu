import Vue from 'vue';
import app from "./App.vue";
import ElementUI from "element-ui";
import 'element-ui/lib/theme-chalk/index.css';
import router from "./router";
import http from './utils/http.js';
import store from "./store";
import "./assets/css/reset.css"





Vue.use(ElementUI)
Vue.prototype.$http = http;  //挂在所有组建的原型对象上，在页面中可以直接用
//创建根实例，并渲染根组件..导入。注册。使用
new Vue({
        el:'#app',
        components:{ app },
        template:"<app />",
        router,
        store
})