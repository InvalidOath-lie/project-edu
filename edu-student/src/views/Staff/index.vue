<template>
	<div class="contain">
		<el-container>
			<el-header>
				<el-form inline  :model="edit.model">
					<el-form-item label="员工名字">
						<el-input clearable prefix-icon="el-icon-search"
						                placeholder="请输入搜索内容"
								v-model="search.stf_name"
								@change="getStaff()"></el-input>
					</el-form-item>
					<el-form-item label="员工类型">
						<el-select clearable v-model="search.stf_category" @change="getStaff()">
							<el-option :value="0"  label="- 全部 -"></el-option>
							<el-option      v-for="item in staffCategory"
							                        :label="item.dic_name"
							                        :value="item.dic_id"
							                        :key="item.dic_id"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button icon="el-icon-plus" type="primary" @click="beginAdd">新增</el-button>
					</el-form-item>
				</el-form>
			</el-header>
			<el-main >
				<el-table :data="tableData"  stripe border>
					<el-table-column label="#" type="index" align="center"></el-table-column>
					<el-table-column label="姓名" prop="stf_name" align="center"></el-table-column>
					<el-table-column label="职务类型"  align="center">
						<template slot-scope="{row}">
							<span v-text="staffCategory.find(item => item.dic_id === row.stf_category).dic_name"></span>
						</template>
					</el-table-column>
					<el-table-column label="备注"  align="center">
						<template slot-scope="{row}">
							<span :class="{ nullMessage: row.stf_remark ===''}" v-text="`${row.stf_remark ===''?'暂无备注':row.stf_remark}`"></span>

						</template>
					</el-table-column>
					<el-table-column label="员工状态"  align="center">
						<template slot-scope="{row}">
							<span :class="{goout: row.stf_invalid ===0}" v-text="`${ row.stf_invalid ===0?'离职':'在职' }`"></span>
						</template>
					</el-table-column>
					<el-table-column label="操作" >
						<template slot-scope="{ row }">
							<el-button type="primary" size="mini" @click="beginUpdate(row)">编辑</el-button>
							<el-button :type="`${ row.stf_invalid ===1?'danger':'warning' }`" size="mini" @click="goAndIn(row)">
								<template>
									<span  v-text="`${ row.stf_invalid ===1?'离职':'入职' }`"></span>
								</template>
							</el-button>
						</template>
					</el-table-column>
				</el-table>
			</el-main>
			<el-footer>
				<el-pagination layout="total,prev,pager,next,jumper,sizes"
							background
				                        :total="pagination.total"
							:page-sizes="[6,7,10,12]"
							:page-size.sync="pagination.pageSize"
							:current-page.sync="pagination.currentPage"
							@current-change="getStaff()"
							@size-change="getStaff(false)">

				</el-pagination>
			</el-footer>
		</el-container>
		<el-dialog :visible="edit.isEdit" :show-close="false" :modal="false">
			<h3 slot="title" v-text="` 员工维护- ${ edit.mode ?'新增':'修改' }`"></h3>
			<el-form ref="form" label-width="80px" :model="edit.model" :rules="rules" status-icon>
				<el-form-item label="员工名字"  prop="stf_name">
					<el-input placeholder="请输入员工姓名" v-model="edit.model.stf_name"></el-input>
				</el-form-item>
				<el-form-item label="员工类型" prop="stf_category">
					<el-select placeholder="请选择员工类型" v-model="edit.model.stf_category">
						<el-option  v-for="item in staffCategory"
						                :label="item.dic_name"
						                :value="item.dic_id"
						                :key="item.dic_id"></el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="员工备注">
					<el-input v-model="edit.model.stf_remark" type="textarea" :rows="3" placeholder="请输入备注"></el-input>
				</el-form-item>
			</el-form>
			<span class="footer">
				<el-button type="primary" @click="save">确定</el-button>
				<el-button @click="edit.isEdit = false">取消</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import { createNamespacedHelpers } from "vuex";
	let { mapState:mapStateFromDictionary ,
		mapActions:mapActionsFromDictionary,
		mapGetters:mapGettersFromDictionary
	}  = createNamespacedHelpers("dictionary");



        export default {
                name:"Staff",
	        data(){
                        return{
				staff:[],
	                        dic_name:"",
	                        search:{
                                        stf_category:0,
                                        stf_name:''
	                        },
	                        edit:{
				        isEdit:false,
		                        mode:true,
				        model:{
				                stf_category:"",
					        stf_name:'',
					        stf_remark:"",
					        stf_id:0
				        },
	                        },
	                        rules:{
                                        stf_name:[
	                                        {
	                                                validator:( rule,value,callback ) => {
	                                                        if( value ==="" ) callback( new Error ("员工名字不能为空" ) );
	                                                        else if( this.tableData.findIndex( item => item.stf_name === value ) !== -1) callback( new Error( "该员工的名字已存在，请区分好员工姓名" ) );
		                                                else callback();
	                                                },trigger:"blur"
	                                        }
                                        ],
                                        stf_category:[
	                                        {
	                                                validator:( rule,value,callback ) => {
	                                                        if( value === "" ) callback( new Error( "员工类型不能为空" ) );
	                                                        else callback();
	                                                },trigger:"change"
	                                        }
                                        ],
	                        },
	                        tableData:[],
	                        pagination:{
				        total:0,
				        pageSize:6,
		                        currentPage:1
	                        }
                        }
	        },
	        computed:{
		        ...mapStateFromDictionary(["dictionary"]),
		        ...mapGettersFromDictionary(["staffCategory"]),

	        },
	        async created(){
	                await this.init();
	                await this.getStaff();
	                console.log( this.dictionary );
                        console.log(this.staffCategory);
                        console.log(this.tableData);

	        },
	        methods:{
		        ...mapActionsFromDictionary(["init"]),
		        async getStaff( fromPage1 = true ){
		                if( fromPage1  ) this.pagination.currentPage =1;
		                let list = await this.$http({
                                        url:"staff/list",
			                method:"post",
			                data:{
				                ...this.search,
				                begin:this.pagination.pageSize * ( this.pagination.currentPage -1 ),
				                pageSize:this.pagination.pageSize
			                }
		                });
                                this.tableData = list.list;
                                this.pagination.total=list.total;
		        },
                        beginAdd(){
		                if( this.$refs.form ) this.$refs.form.resetFields();
		                this.edit.mode = true;
		                this.edit.model.stf_category = "";
		                this.edit.model.stf_name= "";
                                this.edit.isEdit = true;
                        },
		        beginUpdate( staff ){
                                console.log(staff);
                                if(this.$refs.form) this.$refs.form.resetFields();
                                this.edit.mode= false;
                                this.edit.model.stf_category = staff.stf_category;
                                this.edit.model.stf_name = staff.stf_name;
                                this.edit.model.stf_id = staff.stf_id;
                                this.edit.model.stf_remark = staff.stf_remark;
                                this.edit.isEdit= true;
		        },
		        async save(){
		                this.$refs.form.validate( async valid => {
		                        if( !valid ) return;
                                        if( this.edit.mode ){
                                                await this.$http({
                                                        url:"/staff/add",
                                                        method:"post",
                                                        data: this.edit.model
                                                });
                                                this.tableData.push( Object.assign({},this.edit.model) );
                                                this.$message({ message:"添加成功",type:"success" })
                                        }else{
                                                await this.$http({
                                                        url:"/staff/update",
                                                        method:"post",
                                                        data: this.edit.model
                                                });
                                                let i = this.tableData.forEach( item => item.stf_id === this.edit.model.stf_id )
                                                this.tableData.splice( i,1,Object.assign({},this.edit.model) );
                                                this.$message({ message:"修改成功",type:"success" })
                                        }
                                        this.edit.isEdit = false;
		                });

		        },
		        goAndIn(row){
		                console.log(row)
			        if( row.stf_invalid ===1 ){
                                        this.$confirm( `确定让"${ row.stf_name }"离职吗`,"提示",{ type:"warning" } )
                                                .then( async item => {
                                                        await this.$http({ url:"/staff/dimission/" + row.stf_id})
                                                        let i = this.tableData.findIndex( item => item.stf_id===row.stf_id );
					                this.tableData[i].stf_invalid = 0;
                                                        this.$message({ message:"离职成功",type:"success" })
                                                } );

			        }else if( row.stf_invalid ===0 ){
                                        this.$confirm( `确定让"${ row.stf_name }"入职吗`,"提示",{ type:"warning" } )
	                                        .then( async item =>{
                                                        await this.$http({ url:"/staff/reinstate/" +row.stf_id })
                                                        let i = this.tableData.findIndex( item => item.stf_id===row.stf_id );
                                                        this.tableData[i].stf_invalid = 1;
                                                        this.$message({ message:"入职成功",type:"success" })
	                                        } )


			        }

		        }
	        }
        };
</script>

<style scoped>
	.contain{
		height:100%;
	}
	.el-container{
		position: absolute;
		top:0;
		left:0;
		width:100%;
		height:100%;
	}
	.goout{
		color:red;
	}
	.nullMessage{
		color: #aaa;
	}
	.footer{
		display: flex;
		justify-content:center;
	}
</style>







