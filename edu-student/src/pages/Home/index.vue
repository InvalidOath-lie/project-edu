<template>
	<el-container class="page-container">
		<el-header height="80px">
			<h1>山东工商学院后台管理系统 V2.2.1</h1>
			<div >
				<span v-text="name"></span>
				<span>欢迎你</span>
				<el-button @click="exit" plain size="mini">退出 </el-button>
			</div>
		</el-header>
		<el-container>
			<el-aside>
				<el-menu background-color="#606266" text-color="#fff" active-text-color="#ffd04b"
				                :default-active="activeFuncKey" @select="selectHandler">
					<template v-for="item in menuData" >   <!-- key不能直接加在template上，可以给它要渲染的子节点上加-->
						<el-menu-item v-if="item.func_key" :index="item.func_key" :key="item.func_id">
							<i class="el-icon-menu"></i>
							<span v-text="item.func_name" slot="title"></span>
						</el-menu-item>
						<el-submenu v-else :index="item.func_id.toString()" :key="item.func_id">  <!-- index是string类型-->
							<template slot="title">
								<i class="el-icon-setting"></i>
								<span slot="title" v-text="item.func_name"></span>
							</template>
							<template v-if="item.children">
								<el-menu-item v-for="item2 in item.children" :index="item2.func_key" :key="item2.func_key">
									<i class="el-icon-menu"></i>
									<span slot="title" v-text="item2.func_name"></span>
								</el-menu-item>
							</template>
						</el-submenu>
					</template>
				</el-menu>
			</el-aside>
			<el-container>
				<el-main>
					<el-tabs type="card" closable v-model="activeFuncKey" @tab-remove="tabRemoveHandler">
						<el-tab-pane v-for="func_key in activeFuncKeys"
							 :label="menu.find( item => item.func_key === func_key).func_name"
							:key="func_key" :name="func_key" >
							<component :is="views[func_key]"></component>
						</el-tab-pane>
					</el-tabs>
				</el-main>
				<el-footer>
					版权所有&copy;www.gongshang.edu
				</el-footer>
			</el-container>
		</el-container>

	</el-container>

</template>

<script type="text/ecmascript-6">
	import views from '../../views';


	export default{
	        name:"Home",
		data(){
	                return {
	                        menu:[],
                                activeFuncKey:"",
		                activeFuncKeys:[],
		               views,
		                name:sessionStorage.getItem( 'token' )?sessionStorage.getItem( 'user_name' ):"",

	                }
		},
		computed:{
		        menuData(){
		                let result = [];
		                this.menu.filter( item => item.func_fid === 0 ).forEach( item => {
		                        let node = Object.assign( {},item );                                   //对item进行深复制
			                //深复制就是根据当前的值复制，不会影响被复制的值
                                        let children = this.menu.filter ( item2 => item2.func_fid ===item.func_id );   //item2用完就释放了，与后边的item2不冲突
		                        if (children.length > 0){
		                                node .children = [];                                                   //给node动态开辟一个属性
		                                children.forEach( item2  => node.children.push(Object.assign({},item2)));  //此处重新开辟了item2

		                        }
		                        result.push(node);
		                } );

		                return result;
		        }
		},
		methods:{
		        selectHandler(index,indexPath){
		                this.activeFuncKey = index;
		                if( this.activeFuncKeys.indexOf( index ) === -1 ){
		                        this.activeFuncKeys.push( index );
		                }
		        },
                        tabRemoveHandler(name){
                                this.activeFuncKeys.splice( this.activeFuncKeys.indexOf(name),1);
                                if(this.activeFuncKeys.indexOf(this.activeFuncKey)===-1){
                                        this.activeFuncKey = this.activeFuncKeys[0] || "";
                                }
                        },
			exit(){
                                sessionStorage.clear();
                                this.$router.replace( '/login' );
			},

		},
		async created(){
		        this.$store.dispatch("dictionary/init")
		        this.menu = await this.$http({
				url:'/user/getmenu',
				method:"post"
			})
			console.log(this.menu)
		}
	};
</script>

<style scoped>
	a{
		text-decoration: none;
		color: #fff;
	}
	.page-container{
		height:100%;
	}
	.el-header{
		display: flex;
		align-items: center;
		justify-content: space-between;
		background-color: #999;
		color: #fff;
		padding:0 30px;
	}
	h1{
		font-size: 38px;
	}
	 .el-aside{
		 background-color: rgb(96, 98, 102);
	  }
	  .el-footer{
		  display: flex;
		  align-items: center;
		  color:#fff;
		  background-color: #999;
		  justify-content:center;
	     }
	.el-main{
		position:relative;
	}
</style>