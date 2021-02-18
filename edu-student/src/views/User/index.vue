<template>
	<el-container>
		<el-header>
			<el-form :inline="true" ><!--横向排列inline-->
				<el-form-item>
					<el-input clearable prefix-icon="el-icon-search"  label="用户名"
					                placeholder="请输入用户名"
					                v-model.trim="search.user_name"
							@change="getUser()"></el-input>
				</el-form-item>
				<el-form-item>
					<el-select v-model="search.role_id" @change="getUser()">
						<el-option label="- 全部 -" :value="-1"></el-option>     <!--value为-1时为搜索全部-->
						<el-option label="- 无角色 -" :value="0"></el-option>
						<el-option v-for="role in roleList"
						           :label="role.role_name"
						           :value="role.role_id"
						           :key="role.role_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item >
					<el-button type="primary" icon="el-icon-plus" @click="beginAdd">添加用户</el-button>
				</el-form-item>
			</el-form>
		</el-header>
		<el-main>
			<el-table :data="userList" border stripe>
				<el-table-column type="index" label="#"></el-table-column>
				<el-table-column width="150" label="用户名" prop="user_name"></el-table-column>
				<el-table-column label="角色" width="200" align="center">
					<template slot-scope="{row}">
						<span v-if="row.role_id!==null && roleList.length > 0" v-text="roleList.find(item => item.role_id === row.role_id).role_name"></span>
						<span v-else class="no-role"></span>
					</template>
				</el-table-column>
				<el-table-column label="操作">
					<template slot-scope=" { row } ">
						<el-button type="primary" icon="el-icon-edit-outline" @click="beginUpdate(row)" size="mini">修改</el-button>
						<el-button type="warning" icon="el-icon-delete"@click="remove(row.user_name)" size="mini">删除</el-button>
						<el-popover placement="right">
							<el-button @click="beginRoleFuncConfig(row)" type="success" icon="el-icon-setting" slot="reference" size="mini">角色分配</el-button>
							<el-form inline>
								<el-form-item label="用户角色">
									<el-select v-model="edit.model.role_id">
										<el-option label="- 无角色 -" :value="0"></el-option>
										<el-option v-for="role in roleList"
													:key="role.role_id" :label="role.role_name" :value="role.role_id">

										</el-option>
									</el-select>
								</el-form-item>
								<el-form-item>
									<el-button @click="roleFuncConfig" type="primary">分配</el-button>
								</el-form-item>
							</el-form>
						</el-popover>
					</template>
				</el-table-column>
			</el-table>
		</el-main>
		<el-footer>
			<el-pagination
				background
				layout="total,prev,pager,next,jumper,sizes"
				:page-sizes="[6,8,10,12]"
				:total="pagination.total"
				:page-size.sync="pagination.pageSize"
				:current-page.sync="pagination.currentPage"
				@size-change="getUser()"
				@current-change="getUser(false)"
			></el-pagination>   <!--  currentpage只能通过组件改变他，不能通过代码改变，否则会进入死循环...layer中的箭头表示将箭头后的东西顶到末尾-->
		</el-footer>
		<el-dialog :visible="edit.isEdit" :modal="false" :show-close="false" width="500px">
			<h3 slot="title" v-text="`用户编辑 - ${ edit.mode?'新增':'修改' }`"></h3>
			<el-form label-width="80px" :model="edit.model" :rules="edit.rules" ref="form" @validate="formValidateHandler" status-icon>
				<el-form-item  label="用户名" prop="user_name">
					<el-input  :disabled="!edit.mode" v-model="edit.model.user_name"></el-input>
				</el-form-item>
				<el-form-item  label="密码"   prop="user_pwd">
					<el-input v-model="edit.model.user_pwd"></el-input>
				</el-form-item>
			</el-form>
			<span class="footer">
				<el-button type="primary" @click="save">确定</el-button>
				<el-button @click="edit.isEdit=false">取消</el-button>
			</span>
		</el-dialog>
	</el-container>
</template>

<script type="text/ecmascript-6">
        import { createNamespacedHelpers } from "vuex";
        let{ mapState,mapActions } = createNamespacedHelpers("role")
	//该页面中需要请求新的用户数据的时候
        //1.create的时候
        //2.搜索用户名input失去焦点时
        //3.搜索中的el-select的change事件
        //4.分页控件“页码”改变时
        //5.分页控件的页容量“pagesize”发生改变时

        export default{
                name:"User",
                data(){
                        return{
                                search:{
                                        user_name:"",
                                        role_id:-1
                                },
                                pagination:{
                                        total:0,
                                        pageSize:6,
	                                currentPage:1
                                },
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
                                                                        else if( !/^[a-zA-Z][a-zA-Z0-9]{2,19}$/.test(value)) callback( new Error("只能包含字母或数字") );
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
                                //判断h是否要从第一页开始看
                                if( fromPage1 ) this.pagination.currentPage =1;
                               let {list,total } = await this.$http({
	                               url:"/user/list",
	                               method:"post",
	                               data:{
	                                       ...this.search,
		                               begin:this.pagination.pageSize*(this.pagination.currentPage-1),
		                               pageSize:this.pagination.pageSize
	                               }
                               });
                               this.userList = list;
                               this.pagination.total = total;
                        },
                        remove( user_name ){
                                this.$confirm(`确定删除:"${user_name}`, "提示", {type: "warning"})
                                        .then(async() =>{
                                        await this.$http({
                                                url: "/user/remove/" + user_name,
                                                method: "post"
                                        });
                                        let i = this.userList.findIndex( item => item.user_name === user_name );
                                        this.userList.splice( i,1 )
                                        this.$message({message: "删除成功", type: "success"})
                                })
                                        .catch( () => {} )
                        },
                        beginAdd(){
                                if( this.$refs.form ) this.$refs.form.resetFields();
                                this.edit.model.user_name = "";
                                this.edit.model.user_pwd = "";
                                this.edit.model.role_id = null;
                                this.edit.isEdit = true;
                                this.edit.mode = true;
                        },
                        beginUpdate( user ){
                                if( this.$refs.form ) this.$refs.form.resetFields();
                                this.edit.model.user_name = user.user_name;
                                this.edit.model.user_pwd = user.user_pwd;
                                this.edit.model.role_id = user.role_id;
                                this.edit.isEdit = true;
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
                                        await this.$http({ url:"/user/add",method:"post",data:this.edit.model });
                                        this.userList.push( Object.assign( {},this.edit.model ) );
                                        this.$message({ message:"添加成功",type:"success" });
                                }else{
                                        await this.$http({ url:"/user/change_pwd",method:"post",data:this.edit.model });
                                        let i =this.userList.findIndex( item => item.user_name === this.edit.user_name );
                                        this.userList.splice( i,1, Object.assign({},this.edit.model))
                                }
                                this.edit.isEdit = false;
                        },
                        beginRoleFuncConfig( user ){
                                this.edit.model.user_name = user.user_name;
                                this.edit.model.role_id = user.role_id || 0;
                        },
	                async roleFuncConfig(){
                                await this.$http({ method:"post",url:"/user/config_role",data:this.edit.model });
                                let target = this.userList.find( item => item.user_name === this.edit.model.user_name);
                                target.role_id = this.edit.model.role_id || null;
                                this.$message({ message:`用户：${ this.edit.model.user_name },角色分配成功！`,type:"success" });
	                },
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