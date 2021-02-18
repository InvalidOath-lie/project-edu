<template>
	<div>
		<el-container>
			<el-header>
				<el-form inline width="800px">
					<el-form-item label="班级名称：">
						<el-input clearable prefix-icon="el-icon-search"
								v-model="classAll.cls_name"
								@change="getClass()"
								placeholder="请输入搜索内容"></el-input>
					</el-form-item>
					<el-form-item label="班级专业：">
						<el-select v-model="classAll.cls_dic_id_major" @change="getClass()">
							<el-option label="- 全部 -" :value="null"></el-option>
							<el-option :label="item.dic_name" v-for="item in $store.getters['dictionary/getGroupByKey']('class_major')"
										:value="item.dic_id" :key="item.dic_id"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="班级状态">
						<el-select v-model="classAll.cls_status" @change="getClass()">
							<el-option label="- 所有 -" :value="0"></el-option>
							<el-option label="开课中" :value="1"></el-option>
							<el-option label="未开课" :value="2"></el-option>
							<el-option label="已结课" :value="3"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="success" @click="beginAdd"><i class="el-icon-plus"></i>新增</el-button>
					</el-form-item>
				</el-form>
			</el-header>
			<el-main>
				<el-table stripe :data="classMess.classList" >
					<el-table-column label="#" type="index" fixed></el-table-column>
					<el-table-column label="班级名称" prop="cls_name" width="100"></el-table-column>
					<el-table-column label="班级专业" >
						<template slot-scope="{row}">
							<span v-text="dictionary.find( item => item.dic_id === row.cls_dic_id_major ).dic_name"></span>
						</template>
					</el-table-column>
					<el-table-column label="教学老师" prop="cls_stf_id_teacher_name"></el-table-column>
					<el-table-column label="教务老师" prop="cls_stf_id_admin_name"></el-table-column>
					<el-table-column label="就业老师" prop="cls_stf_id_job_name"></el-table-column>
					<el-table-column label="教室">
						<template slot-scope="{row}">
							<span v-text="list.find( item => item.clsr_id === row.cls_clsr_id ) && list.find( item => item.clsr_id === row.cls_clsr_id ).clsr_name"></span>
						</template>
					</el-table-column>
					<el-table-column label="开课时间" prop="cls_begin" width="100"></el-table-column>
					<el-table-column label="结课时间" prop="cls_end"  width="100"></el-table-column>
					<el-table-column label="班级状态">
						<template slot-scope="{row}">
							<span v-if="row.cls_clsr_id === null " class="noclass">未开课</span>
							<span v-else-if="row.cls_clsr_id !==null && row.cls_end ===null &&row.cls_begin !==null" class="classing">开课中</span>
							<span v-else class="overclass">已结课</span>
						</template>
					</el-table-column>
					<el-table-column label="备注" prop="cls_remark"></el-table-column>
					<el-table-column label="操作"  width="300" >
						<template slot-scope="{row}">
							<el-button type="primary"  @click="beginUpdate(row)"><i class="el-icon-edit" >修改</i></el-button>
							<el-button type="success" v-show="(row.cls_clsr_id === null )" @click="beginClass(row)">开课</el-button>
							<el-button v-show="row.cls_begin !== null && row.cls_end ===null &&row.cls_clsr_id !== null " type="danger" @click="beginEnd( row )">结课</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-main>
			<el-footer>
				<el-pagination background
								layout="total,sizes,prev,pager,next,jumper"
								:total="pagination.total"
								:page-sizes="[4,6,8,9,10]"
								:page-size.sync="pagination.pageSize"
								:current-page.sync="pagination.currentPage"
								@current-change="getClass(false)"
								@size-change="getClass(false)"></el-pagination>

			</el-footer>
		</el-container>
		<el-dialog :visible="edit.isEdit" :show-close="false" :modal="false">
			<h2 v-text="`班级维护--${edit.mode?'新增':'修改'}`"></h2>
			<el-form label-width="80px" :model="edit.model" :rules="rules" ref="form" status-icon>
				<el-form-item label="班级名称" prop="cls_name">
					<el-input placeholder="请输入班级的名称" v-model="edit.model.cls_name"></el-input>
				</el-form-item>
				<el-form-item label="班级专业" prop="cls_dic_id_major">
					<el-select v-model="edit.model.cls_dic_id_major">
						<el-option v-for="item in $store.getters['dictionary/getGroupByKey']('class_major')"
									:label="item.dic_name"
									:key="item.dic_id"
									:value="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教学老师" prop="cls_stf_id_teacher">
					<el-select v-model="edit.model.cls_stf_id_teacher">
						<el-option v-for="item in majorTeacher" :label="item.stf_name" :key="item.stf_id" :value="item.stf_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="教务老师" prop="cls_stf_id_admin" >
					<el-select v-model="edit.model.cls_stf_id_admin">
						<el-option v-for="item in adminTeacher" :label="item.stf_name" :key="item.stf_id" :value="item.stf_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="就业老师" prop="cls_stf_id_job">
					<el-select  v-model="edit.model.cls_stf_id_job">
						<el-option v-for="item in jobTeacher" :label="item.stf_name" :key="item.stf_id" :value="item.stf_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="班级备注">
					<el-input placeholder="请输入班级备注" type="textarea" :rows="3" v-model="edit.model.cls_remark"></el-input>
				</el-form-item>
			</el-form>
			<span solt="footer" class="footer">
				<el-button type="primary" @click="save">保存</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
		<el-dialog :visible="isClass" title="选择教室" :show-close="false" :modal="false">
			<el-select v-model="edit.model.cls_clsr_id" >
				<el-option v-for="item in list" :label="item.clsr_name" :value="item.clsr_id"
							:key="item.clsr_id"
							:disabled="item.clsr_occupy === 1"></el-option>
			</el-select>
			<span slot="footer">
				<el-button type="primary" @click="confirmClass">确定</el-button>
				<el-button @click="isClass=false">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import {createNamespacedHelpers} from "vuex";
        import ElButton from "../../../node_modules/element-ui/packages/button/src/button.vue";
	let { mapState:mapStateFromDictionary,mapGetters:mapGettersFromDictionary } = createNamespacedHelpers("dictionary");
	let { mapState:mapStateFromClassroom } = createNamespacedHelpers("classroom");


        export default {
                components: {ElButton},
                name:"Class",
	        data(){
                        return{
                                classMess:{
	                                classList:[]
                                },
	                        classAll:{
                                        cls_name:"",
		                        cls_dic_id_major:null,
		                        cls_status:0,
	                        },
	                        isClass:false,
	                        edit:{
                                        isEdit:false,
		                        mode:true,
		                        //为新增和修改
		                        model:{
                                                cls_id:null,
                                                cls_name:"", //班级名称
                                                cls_dic_id_major:null,   //主修课程
                                                cls_clsr_id:null,                 //教室
                                                cls_stf_id_teacher:null,          //教学老师
                                                cls_stf_id_admin:null,            //教务老师
			                        cls_stf_id_job:null,                  //就业老师
			                        cls_begin:null,                         //开课时间
			                        cls_end:null,                             //结课时间
			                        cls_remark:""                           //备注
                                        }
	                        },
	                        rules:{
                                        cls_name:[
	                                        {
	                                                validator:( rules,value,callback ) =>{
	                                                        if( value ==="" ) callback( new Error( "班级名称不能为空" ) );
	                                                        else if ( this.classMess.classList.findIndex( item => item.cls_name === value  ) !== -1) callback( new Error( "该名字已存在" ) );
	                                                        else callback();
	                                                },trigger:"blur"
	                                        }
                                        ],
                                        cls_dic_id_major:[
	                                        { required:true,message:"教室不能为空",trigger:"change"}
                                        ],
                                        cls_stf_id_teacher:[ { required:true,message:"教学老师不能为空",trigger:"change"} ],
                                        cls_stf_id_admin:[ { required:true,message:"教务老师不能为空",trigger:"change"} ],
                                        cls_stf_id_job:[ { required:true,message:"就业老师不能为空",trigger:"change"} ]

	                        },
	                        pagination:{
                                        total:0,
		                        pageSize:4,
                                        currentPage:1
	                        },
                                majorTeacher:[],
	                        adminTeacher:[],
	                        jobTeacher:[],

                        }
	        },
	        computed:{
		        ...mapStateFromDictionary(["dictionary"]),
		        ...mapStateFromClassroom(["list"]),

	        },
	        async created(){
                        await this.$store.dispatch("classroom/getClassroom");
                        this.getClass();
//	                console.log(this.dictionary);
//	                console.log(this.list);
//	                this.$http({ url:"/staff/listbycategory/" +4 }) .then(data => { this.majorTeacher =  data });
//	                this.$http({ url:"/staff/listbycategory/" + 5 }) .then( data => this.adminTeacher =  data);
//		        this.$http({ url:"/staff/listbycategory/" + 6 }) .then( data => { this.jobTeacher = data;  });
		       let p1 = this.$http({ url:"/staff/listbycategory/" +4 });
		       let p2 = this.$http({ url:"/staff/listbycategory/" + 5 });
		       let p3 = this.$http({ url:"/staff/listbycategory/" + 6 });
		       Promise.all( [p1,p2,p3] )
			       .then( ([a,b,c]) => {
                                       this.majorTeacher = a;
                                       this.adminTeacher = b;
                                       this.jobTeacher = c;
			       } )
			       .catch( (error) => { console.log(error) } )
	        },
	        methods:{
	                //获取班级写成一个函数
		        async getClass( fromPage1 = true ){
		                if( fromPage1 ) this.pagination.currentPage = 1;
                                let list = await this.$http({ url:"/class/list" ,
	                                method:"post",
	                                data:{
		                                ...this.classAll,
                                                begin:this.pagination.pageSize * (this.pagination.currentPage -1),
                                                pageSize:this.pagination.pageSize
	                                }
                                });
                                                this.pagination.total = list.total;
                                                this.classMess.classList = list.list;
                                                console.log(this.classMess.classList)

		        },
	                //开始添加时要做的工作
	                beginAdd(){
		                if( this.$refs.form ) this.$refs.form.resetFields();
		                this.edit.mode = true;
		                this.edit.model.cls_id = null;
                                this.edit.model.cls_name="";//班级名称
                                this.edit.model.cls_dic_id_major=null;  //主修课程
                                this.edit.model.cls_clsr_id=null;                 //教室
                                this.edit.model.cls_stf_id_teacher=null;          //教学老师
                                this.edit.model.cls_stf_id_admin=null;            //教务老师
                                this.edit.model.cls_stf_id_job=null;                  //就业老师
                                this.edit.model.cls_remark="" ;                          //备注
                                this.edit.model.cls_begin=null,                         //开课时间
                                 this.edit.model.cls_end=null,                             //结课时间
		                this.edit.isEdit = true;
	                },
		        //开始修改时要做的工作
		        beginUpdate( data ){
	                        if( this.$refs.form ) this.$refs.form.resetFields();
	                        this.edit.mode=false;
                                this.edit.model.cls_id=data.cls_id;
                                this.edit.model.cls_name=data.cls_name;//班级名称
                                this.edit.model.cls_dic_id_major=data.cls_dic_id_major;  //主修课程
                                this.edit.model.cls_clsr_id=null;                 //教室
                                this.edit.model.cls_stf_id_teacher=data.cls_stf_id_teacher;          //教学老师
                                this.edit.model.cls_stf_id_admin=data.cls_stf_id_admin;            //教务老师
                                this.edit.model.cls_stf_id_job=data.cls_stf_id_job;                  //就业老师
                                this.edit.model.cls_remark=data.cls_remark ;                          //备注
                                this.edit.model.cls_begin=null,                         //开课时间
                                 this.edit.model.cls_end=null,                             //结课时间
	                        this.edit.isEdit = true;
		        },
		        //添加和修改班级
		        save(){
		                this.$refs.form.validate( async valid =>{
		                        if( !valid ) return;
                                        if( this.edit.mode ){
                                                this.edit.model.cls_id = await this.$http({ url:"/class/add",method:"post",data:this.edit.model });
                                                this.edit.model.cls_stf_id_teacher_name = this.majorTeacher.find( item => item.stf_id === this.edit.model.cls_stf_id_teacher ).stf_name;
                                                this.edit.model.cls_stf_id_admin_name = this.adminTeacher.find( item => item.stf_id === this.edit.model.cls_stf_id_admin ).stf_name;
                                                this.edit.model.cls_stf_id_job_name = this.jobTeacher.find( item => item.stf_id === this.edit.model.cls_stf_id_job ).stf_name;
                                                this.classMess.classList.push(Object.assign({},this.edit.model));
                                                this.$message({ message:"添加成功",type:"success" })
                                        }else{
                                                await this.$http({ url:"/class/update",method:"post",data:this.edit.model });
                                                this.edit.model.cls_stf_id_teacher_name = this.majorTeacher.find( item => item.stf_id === this.edit.model.cls_stf_id_teacher ).stf_name;
                                                this.edit.model.cls_stf_id_admin_name = this.adminTeacher.find( item => item.stf_id === this.edit.model.cls_stf_id_admin ).stf_name;
                                                this.edit.model.cls_stf_id_job_name = this.jobTeacher.find( item => item.stf_id === this.edit.model.cls_stf_id_job ).stf_name;
                                                let i = this.classMess.classList.findIndex( item => item.cls_id === this.edit.model.cls_id );
                                                this.classMess.classList.splice( i,1,this.edit.model )
                                                this.$message({ message:"修改成功",type:"success" })
                                        }
                                        this.edit.isEdit = false;
		                } );

		        },
		        //开课
		        beginClass( row ){
		                console.log(row)
			        this.$confirm(`确定对"${ row.cls_name }"进行 开课 操作吗？` ,"提示",{
			                confirmButtonText:"确定",
				        cancelButtonText:"取消",
				        type:"warning"
			        })
				        .then( () => {
						this.isClass = true;
						this.edit.model.cls_id = row.cls_id;
				        } )
				        .catch( () =>{} )
		        },
                        async confirmClass(){
		                let beginTime = await this.$http({ url:"/class/begin" ,method:"post",data:this.edit.model});
		                this.list.find( item => item.clsr_id ===  this.edit.model.cls_clsr_id).clsr_occupy = 1;
                                this.classMess.classList.find( item => item.cls_id === this.edit.model.cls_id ).cls_begin = beginTime;
                                this.classMess.classList.find( item => item.cls_id === this.edit.model.cls_id ).cls_clsr_id =this.edit.model.cls_clsr_id;
		                this.$message({ message:"开课成功",type:"success" });
                                this.isClass=false;
                        },
		        //结课
		        beginEnd( ending ){
                                console.log(ending);
                                this.$confirm( `确定对“${ ending.cls_name }”进行 结课 操作吗？`,"提示",{
                                        confirmButtonText:"确定",
	                                cancelButtonText:"取消",
	                                type:"warning"
                                } )
	                                .then( async () => {
	                                        this.edit.model.cls_id = ending.cls_id;
                                                let endTime = await this.$http({ url:"/class/end",method:"post",data:this.edit.model });
                                                this.classMess.classList.find( item => item.cls_id ===ending.cls_id ).cls_end = endTime;
                                                this.$message({ message:"结课成功",type:"success" });
	                                } )
	                                .catch( () => {} )
		        },

	        }
        };
</script>

<style scoped>
	div{
		height: 100%;
	}
	.el-header{
		width:1350px;
	}
	.el-container{
		position: absolute;
		top:0;
		left:0;
		width:100%;
		height:99%;
	}
	.el-table{
		overflow: auto;
	}
	.el-table__body-wrapper{
		overflow: auto;
	}
	h2{
		margin-bottom: 20px;
	}
	span.footer{
		display:flex;
		justify-content: center;
	}
	.noclass{
		color: #E6A294;
	}
	.classing{
		color: #7EC23A;
	}
	.overclass{
		color: #D6CCCC;
	}
</style>