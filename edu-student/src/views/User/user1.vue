<template>
	<el-container>
		<el-header>
			<el-form :inline="true" clearable><!--横向排列inline-->
				<el-form-item>
					<el-input lable="用户名" placeholder="请输入用户名" v-model.trim="edit.user_name"></el-input>
				</el-form-item>
				<el-form-item>
					<el-select v-model="search.role_id">
						<el-option label="- 全部 -" value="-1"></el-option>     <!--value为-1时为搜索全部-->
						<el-option label="- 无角色 -" value="0"></el-option>
						<el-option v-for="role in list"
									:label="role.role_name"
									:value="role.role_id"
									:key="role.role_id"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="userList" border stripe>
				<el-table-column type="index" lable="#"></el-table-column>
				<el-table-column width="150" lable="用户名" prop="user_name"></el-table-column>
				<el-table-column label="角色" width="200" align="center">
					<template slot-scope="{row}">
						<span v-if="row.role_id!==null && roleList.length > 0" v-text="roleList.find(item => item.role_id === roe.role_id).role_name"></span>
						<span v-else class="no-role"></span>
					</template>
				</el-table-column>
				<el-table-column lable="操作">
					<template slot-scope=" { row } ">
						<el-button type="primary" icon="el-icon-edit-outline">修改</el-button>
						<el-button type="warning" icon="el-icon-delete">删除</el-button>
						<el-button type="success" icon="el-icon-setting">角色分配</el-button>
					</template>

				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination
				background

				></el-pagination>
		</el-footer>
		<el-dialog :visible="edit.isEdit" :modal="false" :show-close="false" width="500px">
			<h3 slot="title" v-text="`用户编辑 - ${ edit.mode?'新增':'修改' }`"></h3>
			<el-form lable-width="80px" :model="edit.model" :rules="edit.rules" ref="form" @validate="formValidateHandler">
				<el-form-item lable="用户名" prop="user_name">
					<el-input :disable="!edit.mode" v-model="edit.model.user_name"></el-input>
				</el-form-item>
				<el-form-item lable="密码"  prop="user_pwd">
					<el-input v-model="edit.model.user_pwd"></el-input>
				</el-form-item>
			</el-form>
			<span class="footer">
				<el-button type="primary">确定</el-button>
				<el-button>取消</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
	import { createNamespacedHelpers } from "vuex";
	let{ mapState,mapActions } = createNamespacedHelpers("role")


        export default{
                name:"User",
	        data(){
                        return{
                                search:{
					user_name:"",
	                                role_id:-1
                                },
	                        pagination:{},
	                        userList:[],
	                        edit:{
                                        isEdit:false,
		                        mode:true,
		                        model:{ user_name:"", user_pwd:"",role_id:null},
		                        rules:{
                                                user_name:[
	                                                {
	                                                        validator:async ( rule,value,callback ) => {
	                                                                if( !this.edit.mode )  callback();
	                                                                else if( !/^[a-zA-Z][a-zA-Z0-9]{2-19}$/ .test(value)) callback( new Error("只能包含字母或数字") );
	                                                                else if( await this.$http({ method:"post",url:"/user/valid_name",data:{ user_name:value } }) )   callback( new Error("*用户名已存在") );
	                                                                else   callback();
	                                                        },trigger:"blur"
	                                                }
                                                ],
			                        user_pwd:[
				                        { required:true,massage:"密码不能为空",trigger:"blur" },
				                        { min:3,max:10,message:"密码长度为3-10",trigger:"blur" }
			                        ]
		                        }
	                        }
                        }
	        },
	        computed:{
		        ...mapState({ "roleList":"list" })
	        },
	        methods:{
		        ...mapActions({"roleInit":"init"}),
		        async getUser( fromPage1 = true ){
		                await this.$http({ url:"user/all",method:"post",data:{ ...this.search,begin:this.userList.length,pageSize:6 } })
		        },
		        remove( user_name ){
		                this.$confirm( `确定删除:"${user_name}`,"提示",{ type:"warning" } );
		                        .then( async () => {
		                                await this.$http({ url:"user/remove" ,method:"post",data{ user_name:user_name }});
		                                this.$message({ message:"删除成功",type:"success" } )
			        } )
				        .catch( () => {} )
		        },
		        beginAdd(){
		                this.edit.model.user_name = "";
		                this.edit.model.user_pwd = "";
		                this.edit.model.role_id = null;
		                this.edit.isEdit = true;
		                this.edit.mode = true;
		        },
		        beginUpdate( user ){
		                this.edit.model.user_name = user.user_name;
		                this.edit.model.user_pwd = user.user_pwd;
		                this.edit.model.role_id = user.role_id;
		                this.edit.isEdit = false;
		                this.edit.mode = false;
		        },
                        formValidateHandler( prop,valid,message ){
		                if( prop ==="user_name" ) this.userNameValidateResult = valid;     //验证的字段是否是user_name
                        },
		        async save(){
                                if( this.edit.mode ){
                                        if( this.userNameValidateResult === false ) return;
                                        if( typeof this.userNameValidateResult === "undefined" ){
                                                await new Promise ( resolve => this.$refs.form.validateField( "user_name",message => {
                                                        if( message ==="" ) resolve()
                                                } ) )
                                        }
                                }
                                await new Promise( resolve => this.$refs.form.validateField( "user_pwd",message =>{
                                        if( message ==="" ) resolve();
                                } ) );
                                //代码能执行到这里说明用户名和密码验证完毕，可以执行后续真正的新增与修改操作了
		                if( this.edit.mode ){
					await this.$http({ url:"、user/add",method:"post",data:this.edit.model });
					this.userList.push( Object.assign( {},this.edit.model ) );
					this.$message({ message:"添加成功",type:"success" });
		                }else{
					await this.$http({ url:"/user/change_pwd",method:"post",data:this.edit.model });
					let i =this.userList.findIndex( item => item.user_name === this.edit.user_name );
					this.userList.splice( i,1, Object.assign({},this.edit.model))
		                }
		                this.edit.isEdit = false;
		        }
                },
	        created(){
			this.roleInit();
			this.getUser();
                }

	}
</script>

<style scoped>
	.el-container{
		position:absolute;
		top:0;
		left:0;
		width:100%;
		height:100%;
	}
	.el-main{
		border-top:1px solid #b0b0b0;;
		border-bottom:1px solid #b0b0b0;
	}
	.el-footer{
		display: flex;
		align-items: center;
	}
	span.no-role{
		color:#b0b0b0;
	}
</style>