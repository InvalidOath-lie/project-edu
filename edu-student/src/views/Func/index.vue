<template>
	<div>
		<el-tree :data="treeData" default-expand-all class="custom-tree" :expand-on-click-node="false">
			<span slot-scope="{ node,data }" class="custom-tree-node">
				<span v-text="data.func_name"
				      :class="{root:data.func_id===0,noleaf:data.func_key ==='',leaf:data.func_key!==''}"></span>
				<span>
					<el-button type="text" v-if="data.func_key===''" @click="beginAdd(data)"><i
						class="el-icon-plus"></i></el-button>
					<el-button type="text" v-if="data.func_id !==0" @click="beginUpdate(data)"><i
						class="el-icon-edit"></i></el-button>
					<el-button type="text" v-if="[ 0,44,45].indexOf(data.func_id )=== -1 "
					           :disabled="!!data.children" @click="remove(data)">  <!-- 两个!!类型强转,第一个！是指把数组强制变成布尔类型，但是变成的是布尔类型的反，再取一次反就成了布尔类型-->
						<!--   typeof(data.children)!=='undefined'-->
						<i class="el-icon-delete"></i>
					</el-button>
				</span>
			</span>
		</el-tree>
		<el-dialog :modal="false"  :visible="edit.isEdit" :show-close="false" :close-on-click-model="false" width="600px" :close-on-press-escape="false">
			<el-form ref="form" label-width="120px" :model="edit.model" :rules="edit.rules">
				<el-form-item label="节点类型：">
					<el-radio v-model="edit.isLeaf" :label="true" :disabled="!(edit.mode && edit.model.func_fid === 0)">叶子节点</el-radio>
					<el-radio v-model="edit.isLeaf" :label="false" :disabled="!(edit.mode && edit.model.func_fid === 0)">非叶子节点</el-radio>
				</el-form-item>
				<el-form-item label="父节点：">
					<el-select  v-model="edit.model.func_fid" :disabled="edit.mode || !edit.isLeaf">
						<el-option
							v-for="item in selectData"
							:key="item.value"
							:label="item.label"
							:value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="组件名称" prop="func_name">
					<el-input  v-model.trim="edit.model.func_name" placeholder="请输入系统功能名称"></el-input>
				</el-form-item>
				<el-form-item  label="绑定组件" prop="func_key" v-show="edit.isLeaf">
					<el-select placeholder="请选择组件" v-model="edit.model.func_key">
						<el-option
							v-for="item in Object.keys(views)"
							:key="item"
							:label="item"
							:value="item"
							:disabled="list.findIndex( func => func.func_key === item ) !==-1"></el-option>
					</el-select>
				</el-form-item>
			</el-form>
			<span slot="footer">
				<el-button type="primary" @click="save">确定</el-button>
				<el-button @click="edit.isEdit=false">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
        import views from '../../views';
        import{ createNamespacedHelpers } from "vuex";
        let { mapState,mapGetters,mapActions }=createNamespacedHelpers("func")

        export default {
                name: "Func",
                data(){
                        return {
                                funcs: [],
                                views,
                                funcName:"",
                                edit:{
                                        mode:true,  //true是新增。false是修改
                                        isEdit:false,   //标识是否进入了编辑状态
                                        isLeaf:true,    //标识当前编辑的是不是叶子节点
                                        model:{ func_id:0,func_name:'',func_key:'',func_fid:-1 },
                                        rules:{
                                                func_name:[
                                                        {
                                                                validator:( rule,value, callback ) => {
                                                                        //ES6的解构赋值
                                                                        let { func_id,func_name,func_fid } =this.edit.model;
                                                                        if( value.length ===0 )
                                                                                callback(new Error('*功能名称不能为空'));
                                                                        else if(value.length < 2 || value.length >50)
                                                                                callback(new Error("*功能名称长度在2-50"));
                                                                        else if(this.list.some(item => item.func_id !==func_id && item.func_name ===func_name && item.func_fid === func_fid))
                                                                                callback(new Error("*功能名称在当前父级中已存在"))
                                                                        else
                                                                                callback()
                                                                },
                                                                trigger:"blur"
                                                        }
                                                ],
                                                func_key:[
                                                        {
                                                                validator:( rule,value,callback ) => {
                                                                        if(this.edit.mode && this.edit.isLeaf && value ==="")
                                                                                callback(new Error ("*叶子结点必须绑定组件"))
                                                                        else
                                                                                callback()
                                                                },
                                                                trigger:"blur"
                                                        }
                                                ]
                                        }
                                },
                        }
                },
                computed: {
                        ...mapState(["list"]),
                        ...mapGetters(["listToTree"]),
                        treeData(){
                                return[{
                                        func_id:0,
                                        func_name:"Root",
                                        func_key:"",
                                        func_fid:-1,
                                        children:this.$store.getters["func/listToTree"]
                                }]
                        },
                        selectData(){
                                let result = [ { label:"Root",value:0 } ];
                                this.list.filter( item => item.func_key === "" ).forEach( item => {
                                        result.push( { label:item.func_name,value:item.func_id } )
                                } );
                                return result;
                        },
                },
                async created(){
                       await this.$store.dispatch( "func/init" );
                },
                methods: {
                        ...mapActions(["init","addFunc","removeFunc","updateFunc"]),
                        remove( node ) {
                                this.$confirm( `你确定要删除'${node.func_name}'节点吗？`,"警告",{ type:"warning" } )
                                        .then( async() => {
//					        await this.remove(node.func_id)
                                                await this.$store.dispatch( "func/removeFunc",node.func_id )
                                                this.$message({
                                                        message: '删除成功，即将刷新页面',
                                                        type: 'success'
                                                });
                                                setTimeout(function(){
                                                        history.go(0)
                                                },500)
                                        } )
                        },
                        beginAdd(  parentNode ){
                                //点击新增时做的准备
                                this.edit.mode = true;
                                this.edit.isLeaf = parentNode.func_id!==0;
                                this.edit.model.func_id = 0;
                                this.edit.model.func_name ="";
                                this.edit.model.func_key="";
                                this.edit.model.func_fid = parentNode.func_id;
                                this.edit.isEdit = true;
                        },
                        beginUpdate(node){
                                this.edit.mode = false;
                                this.edit.isLeaf = node.func_key!=="";
                                this.edit.model.func_id = node.func_id;
                                this.edit.model.func_name =node.func_name;
                                this.edit.model.func_key=node.func_key;
                                this.edit.model.func_fid = node.func_fid;
                                this.edit.isEdit = true;
                        },
                        save(){
                                this.$refs.form.validate( async valid =>{
                                        if( !valid  ) return;
                                        if( this.edit.mode ){
                                                await this.$store.dispatch("func/addFunc",Object.assign({},this.edit.model));
                                                this.$message({
                                                        message: `"${ this.edit.model.func_name }"节点添加成功，即将刷新页面`,
                                                        type: 'success'
                                                });
                                        }else{
                                                await this.$store.dispatch("func/updateFunc",Object.assign({},this.edit.model))
                                                this.$message({
                                                        message: `"${ this.edit.model.func_name }"节点修改成功，即将刷新页面`,
                                                        type: 'success'
                                                });
                                        }
                                        this.edit.isEdit = false;
                                } )
                        }
                }
        };
</script>

<style scoped>
	.custom-tree {
		width: 500px;
	}

	span.custom-tree-node {
		display: flex;
		flex: 1; /*flex-shrink,flex-basis,flex-grown的缩写*/
		justify-content: space-between;
		align-items: center;
	}

	span.root {
		color: #f00 !important;
	}

	span.noleaf {
		color: darkgreen;
	}

	span.leaf {
		color: yellowgreen;
	}
</style>


<!--
	递归
计算1-100，能不用递归就不用递归，可以用n*(n-1)/2

-->