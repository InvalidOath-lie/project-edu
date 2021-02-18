import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../pages/Home";
import Login from "../pages/Login";

Vue.use(VueRouter);

let router = new VueRouter({
        routes:[
                { path:"/",redirect:"login" },
                { path:"/home",component:Home },
                { path:"/login",component:Login }
        ]
});
router.beforeEach( (to,from,next) =>{
        if( to.path === "/home" && !sessionStorage.getItem( "token" ) ){
                next("/login");
        }
        next();
} );

export default router;