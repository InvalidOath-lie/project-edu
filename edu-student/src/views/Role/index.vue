<template>
	<div>
		<el-row :gutter="20">
			<el-col v-for="item in list" :span="6" :key="item.role_id">
				<el-card shadow="hover">
					<span v-text="item.role_name"></span>
					<div class="buttonWrapper">
						<el-button class="but" type="text" @click="beginEdit( item )"><i class="el-icon-edit"></i>
						</el-button>
						<el-button class="but" type="text"><i class="el-icon-delete" @click="remove(item.role_id)"></i>
						</el-button>
						<el-button  @click="beginRoleFuncConfig( item.role_id )" size="mini">功能分配</el-button>
					</div>
				</el-card>
			</el-col>
			<el-col :span="6">
				<el-card class="btnAdd" @click.native="beginAdd">
					<i class="el-icon-plus"></i>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog :visible="isShow" :show-close="false" :modal="false">
			<h3 slot="title">角色管理-新增</h3>
			<el-form :rules="rules" :model="role" ref="form" status-icon>
				<el-form-item label="角色" label-width="40px" prop="role_name">
					<el-input v-model="role.role_name"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button @click="isShow=false">取消</el-button>
				<el-button @click="confirm" type="primary">确定</el-button>
			</span>
		</el-dialog>
		<el-drawer :visible.sync="edit2.isEdit" :show-close="false" class="custom-drawer" :modal="false"
					size="500px" >  <!--关闭固定的蒙版-->
			<h3 slot="title">角色功能分配</h3>
			<el-tree class="custom-tree" :data="edit2.treeData" default-expand-all :expand-on-click-node="false">
				<span slot-scope="{ node,data }" :class="{ parent:data.func_key ==='' }" class="custom-tree-node">
					<span>
						<i v-if="data.func_key!==''" class="el-icon-paperclip"></i>
						<span v-text="data.func_name"></span>
					</span>
					<span class="switch-wrapper">
						<el-switch v-model="data.open" @change="switchChangeHandler(data)"></el-switch>
					</span>
				</span>
			</el-tree>
			<div class="drawer-footer">
				<el-button type="primary" @click="roleFuncConfig">确定</el-button>
				<el-button @click="edit2.isEdit = false">取消</el-button>
			</div>
		</el-drawer>
	</div>
</template>

<script type="text/ecmascript-6">
	//在需要映射多个子仓库中的东西时，在映射完之后可以重命名
//	：给被解构的数据取别名
//	let { mapState:mapStateFormFunc(别名) } = createNamespacedHelpers(func)




	import { createNamespacedHelpers } from "vuex";
	let { mapGetters:mapGettersFromFunc } = createNamespacedHelpers( "func" );
        let { mapActions:mapActionsFromFunc } = createNamespacedHelpers( "func" );
        let { mapState:mapStateFromFunc } = createNamespacedHelpers( "role" );



        export default {
                name: "Role",
                data(){
                        return {
//                                roles: [],
	                        role:{
                                        role_name: "",
		                        role_id:0
	                        },
                                isShow: false,
	                        mode:true,
	                        roleFuncIds:[],
	                        edit2:{
                                        isEdit:false,
		                        model:{
                                                role_id:0,
			                        role_func_ids:""
		                        },
		                        treeData:[]
	                        },
	                        rules:{
                                        role_name:[
	                                        {
	                                                validator:( rule,value,callback ) => {
	                                                        if( !value ) callback( new Error ( " 角色不能为空 " ) );
	                                                        else if( value.length < 2 || value.length >10 ) callback( new Error( "名称长度在2-10" ) );
	                                                        else if ( this.list&&this.list.some( item => item.role_name===value ) ) callback( new Error( value+" 角色已存在" ) );
		                                                else callback();
	                                                },trigger:'blur'
	                                        }
                                        ]
	                        }
                        }
                },
                async created(){
//                        this.roles = await this.$http({url: "/role/all"});
	                await this.$store.dispatch( "role/init" );
	                await this.initFunc();
                },
	        computed:{
		        ...mapStateFromFunc(["list"]),
		        ...mapGettersFromFunc(["listToTree"])      //从func中把listToTree导过来
	        },
                methods: {
//	                ...mapActions([ "init","addRole" ]),
	                ...mapActionsFromFunc({ initFunc:"init" }),    //如果在映射时想改变仓库中方法的名字，可以在map..后给一个对象，{ “想给的名字”，被改的方法名 }
                        remove(id){
                                this.$confirm("该角色将被删除，是否继续？", '提示', {
                                        confirmButtonText: "确定",
                                        cancelButtonText: "取消",
                                        type: "warning"
                                })
                                        .then(() =>{
                                                this.$http({method: "post", url: "/role/remove/" + id});
                                                this.list.splice(this.list.findIndex(item => item.role_id === id), 1)
                                                this.$message({
                                                        type: 'success',
                                                        message: "删除成功!"
                                                });
                                        })
                                        .catch(() =>{
                                                this.$message({
                                                        type: "info",
                                                        message: "已取消删除"
                                                });
                                        });
                        },
	                beginAdd(){
                                if( this.$refs.form ) this.$refs.form.resetFields();
                                this.role.role_name="";
                                this.mode =true;
                                this.isShow = true;
	                },
                        beginEdit( role ){
	                        if( this.$refs.form ) this.$refs.form.resetFields();
	                        this.role.role_name = role.role_name;
	                        this.role.role_id = role.role_id;
	                        this.isShow = true;
	                        this.mode = false;
                        },
                        async beginRoleFuncConfig( role_id ){
				let roleFuncs = await this.$http({ url:"/role_function/list/" + role_id });
				let roleFuncIds = roleFuncs.reduce (( result,item ) => {
				        result.push(item.func_id);
				        return result;
				},[] );
				this.updateTreeData(roleFuncIds);
				this.edit2.model.role_func_ids = "";
				this.edit2.model.role_id = role_id;
                                this.edit2.isEdit = true;
                        },
                        switchChangeHandler( node ){
                                console.log(node)
                                if( node.func_key === "" ){    //非叶子节点
                                        node.children && node.children.forEach( item => item.open = node.open );
                                }else{    //叶子节点
                                        let parent = this.edit2.treeData.find( item => item.func_id === node.func_fid );
                                        parent.open = parent.children.some( item => item.open );
                                }
                        },
	                updateTreeData( roleFuncIds ){    //拿当前的role_FuncIds和listTotree来更新treedata
                               let result = JSON.parse( JSON.stringify( this.listToTree ) );
                               result.forEach( item =>{
                                       item.open = roleFuncIds.indexOf( item.func_id ) !== -1;
                                       item.children && item.children.forEach( item2 => item2.open = roleFuncIds.indexOf(item2.func_id)!==-1 )
                               } );
		                this.edit2.treeData = result;
	                },
                       async roleFuncConfig(){
	                        //发ajax前统计树中所有open节点的func_id
	                        let func_ids = [];
	                        this.edit2.treeData.forEach( item => {
	                                if( item.open ) func_ids.push( item.func_id );
	                                item.children && item.children.forEach( item2 => {
	                                        if( item2.open ) func_ids.push( item2.func_id );
	                                } )
	                        } );
	                        this.edit2.model.role_func_ids = func_ids.join( "," );
	                        //发ajax
	                        await this.$http({ url:"role_function/config",method:"post",data:this.edit2.model });
	                        //ajax发送成功返回后的相应界面变化
	                        this.edit2.isEdit = false;
	                        this.$message({ message:"角色功能分配成功",type:"success" })
                        },
                        confirm(){
                                this.$refs.form.validate ( async valid => {
                                        if(!valid) return;
                                        if( this.mode ) {
                                                await this.$store.dispatch( "role/addRole",Object.assign({},this.role) );
//                                                let id = await this.$http({
//                                                        method: "post",
//                                                        url: "/role/add",
//                                                        data: {  role_name:this.role.role_name },
//                                                });
//                                                this.roles.push( Object.assign( {},  this.role, {id}) )
                                                this.$message({type: "success", message: "添加成功"});
                                        }else{
                                                await this.$store.dispatch( "role/updateRole",Object.assign({},this.role) );
//                                                await this.$http({ url:"/role/update",method:"post",data:this.role });
//                                                let i =this.roles.findIndex( item => item.role_id === this.role.role_id );
//                                                this.roles.splice( i,1, Object.assign( {},this.role ) );
                                                this.$message({type: "success", message: "修改成功"});
                                        }
                                        this.isShow = false;
                                } )

                        }
                },
		watch:{
                        listToTree(){     //监听用户在功能页面改变功能时，listtree此时会改变
                                this.edit2.isEdit = false;   //在用户添加功能时将该编辑状态关闭，将数据更新，再次打开时就能得到新的数据
	                        this.updateTreeData([]);   //传空数组是为了表明现在角色没有处于编辑状态的
                        }
		}

        };

</script>

<style scoped>
	.el-form {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.el-dialog {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.el-col {

		margin-top: 30px;
	}

	.el-card {
		text-align: center;
		padding: 10% 0; /*占父元素纵向的10%*/
		background-color: lightgrey;
		color: #fff;
		font-size: 25px;
		cursor: pointer;
		position: relative;
	}

	.buttonWrapper {
		position: absolute;
		right: 10px;
		buttom: 0;
	}

	.but {
		font-size: 25px;
		color: #fff;
	}

	.btnAdd {
		font-size: 25px;
		padding: 10% 0;
		background-color: transparent;
		color: pink;
		border: 1px dashed #f00;
	}

	.custom-tree{
		width:400px;
	}
	.custom-tree-node.parent{
		margin:50px 0;
		padding-right: 50px;
		color: #0094ff;
	}

	span.custom-tree-node{
		flex:1;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.drawer-footer{
		text-align: center;
	}
</style>