<template>
	<div>
		<el-container>
			<!--搜索-->
			<el-header >
				<el-form inline >
					<el-form-item label="学生名字">
						<el-input placeholder="请输入要搜索的学生姓名" v-model="studentAll.stu_name" @change ="getStudents()"></el-input>
					</el-form-item>
					<el-form-item label="所在班级">
						<el-select v-model="studentAll.stu_cls_id" @change="getStudents()">
							<el-option :value="0" label="- 所有班级 -"></el-option>
							<el-option v-for="item in classList" :label="item.cls_name" :key="item.cls_id" :value="item.cls_id"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="学生学历">
						<el-select  v-model="studentAll.stu_qualification" @change="getStudents()">
							<el-option label="- 全部 -" :value="null"></el-option>
							<el-option v-for="item in getGroupByKey('qualification')" :label="item.dic_name" :value="item.dic_id" :key="item.dic_id"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="beginAdd" size="mini"><i class="el-icon-plus" ></i>新增</el-button>
						<el-button type="success" @click="beginNum" size="mini"><i class="el-icon-share" > </i>批量分班</el-button>
						<el-button type="danger" size="mini"><i class="el-icon-download">导出学生信息</i></el-button>
					</el-form-item>
				</el-form>
			</el-header>
			<el-main>
				<el-table :data="student" border @selection-change="handleSelectionChange" :row-key="getRowKeys">
					<el-table-column label="#" type="index" fixed></el-table-column>
					<el-table-column type="selection" fixed width="50" align="center" :reserve-selection="true"></el-table-column>
					<el-table-column label="学生名字" fixed  width="80" prop="stu_name" align="center"></el-table-column>
					<el-table-column label="班级"  width="100">
						<template slot-scope="{row}">
							<span v-text="classList.find( item => item.cls_id === row.stu_cls_id ) ? classList.find( item => item.cls_id === row.stu_cls_id ).cls_name :'无班级'" :class="{haveNoClass:row.stu_cls_id===null}"></span>
						</template>
					</el-table-column>
					<el-table-column label="存档照片" width="150" align="center">

					<template slot-scope="{row}">
						<el-popover
							placement="right"
							title="当前图片"
							width="200"
							trigger="click"
						>
							<img  :src="row.stu_avatar===null ? '/images/student/1610000815615.jpg':row.stu_avatar "/>
							<el-button slot="reference">预览</el-button>
						</el-popover>
					</template>

					</el-table-column>
					<el-table-column label="性别" >
						<template slot-scope="{ row }">
							<span v-text="row.stu_sex ===1?'男':'女'"></span>
						</template>
					</el-table-column>
					<el-table-column label="联系电话"  width="200" prop="stu_phone" align="center"></el-table-column>
					<el-table-column label="联系电话（备用）"  width="200" prop="stu_phone2" align="center"></el-table-column>
					<el-table-column label="出生日期"  width="120" prop="stu_born" align="center"></el-table-column>
					<el-table-column label="学历"  width="100" align="center">
						<template slot-scope="{row}">
							<span v-if="row.stu_qualification ===1">本科及以上</span>
							<span v-else-if="row.stu_qualification ===2">专科</span>
							<span v-else>高中及以下</span>
						</template>
					</el-table-column>
					<el-table-column label="毕业院校"  width="150" prop="stu_school" align="center"></el-table-column>
					<el-table-column label="院校专业"  width="200" prop="stu_major"></el-table-column>
					<el-table-column label="家庭住址"  width="200" prop="stu_address"></el-table-column>
					<el-table-column label="备注"  width="300" prop="stu_remark"></el-table-column>
					<el-table-column label="操作" fixed="right"  width="450">
						<template slot-scope="{row}">
							<el-button size="mini"  type="success"><i class="el-icon-share" @click="beginDevide(row)">分班</i></el-button>
							<el-button size="mini"  type="danger"><i class="el-icon-picture" @click="beginUpload(row)">照片存档</i></el-button>
							<el-button size="mini"  type="primary" @click="beginUpdate(row)"><i class="el-icon-edit"></i>编辑</el-button>
							<el-button size="mini"  type="warning"><i class="el-icon-delete"></i>删除</el-button>
						</template>

					</el-table-column>
				</el-table>
			</el-main>
			<el-footer>
				<el-pagination layout="total,sizes,prev,pager,next,jumper"
								:total="pagination.total"
								:page-sizes="[5,6,8,9]"
								:page-size.sync="pagination.pageSize"
								:current-page.sync="pagination.currentPage"
								@size-change="getStudents()"
								@current-change="getStudents(false)"></el-pagination>
			</el-footer>
			<!--增加和修改学生对话框-->
			<el-dialog :visible="edit.isEdit" width="800px" :show-close="false" :modal="false">
				<h3 slot="title" v-text="`学生维护- ${ edit.mode?'增加':'修改' }`" >学生维护</h3>
				<el-form  label-width="120px" ref="form" :model="edit.model" :rules="rules" status-icon>
					<el-form-item prop="stu_name" label="学生姓名："  >
						<el-input v-model="edit.model.stu_name" placeholder="请输入学生的名字"></el-input>
					</el-form-item>
					<el-form-item label="性别：">
						<el-radio :label="edit.model.stu_sex" :value="1" @change="edit.model.stu_sex=1">男</el-radio>
						<el-radio :label="edit.model.stu_sex" :value="2" @change="edit.model.stu_sex=2">女</el-radio>
					</el-form-item>
					<el-form-item label="联系电话：" prop="stu_phone">
						<el-input v-model="edit.model.stu_phone" placeholder="请输入手机号" maxlength="11" show-word-limit></el-input>
					</el-form-item>
					<el-form-item label="备用电话：" prop="stu_phone2" >
						<el-input v-model="edit.model.stu_phone2" placeholder="请输入备用联系人电话（手机号/座机号）" maxlength="11" show-word-limit>
							<template slot="append">例如：132-88888888</template>
						</el-input>
					</el-form-item>
					<el-form-item label="出生日期：">
						<el-date-picker value-format="yyyy-MM-dd" v-model="edit.model.stu_born" placeholder="请选择日期" prefix-icon="el-icon-date"></el-date-picker>
					</el-form-item>
					<el-form-item label="学历：">
						<el-select v-model="edit.model.stu_qualification">
							<el-option v-for="item in getGroupByKey('qualification')" :label="item.dic_name" :value="item.dic_id" :key="item.dic_id"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item label="在读/毕业院校">
						<el-input v-model="edit.model.stu_school" placeholder="请输入在读/毕业院校（选填）"></el-input>
					</el-form-item>
					<el-form-item label="在校学习专业">
						<el-input v-model="edit.model.stu_major" placeholder="请输入在校学习专业（选填）"></el-input>
					</el-form-item>
					<el-form-item label="家庭住址" prop="stu_address">
						<el-input v-model="edit.model.stu_address" placeholder="请输入家庭住址"></el-input>
					</el-form-item>
					<el-form-item label="学生备注">
						<el-input v-model="edit.model.stu_remark" type="textarea" :row="4"></el-input>
					</el-form-item>

				</el-form>
				<span slot="footer">
					<el-button type="primary" @click="save">确定</el-button>
					<el-button @click="edit.isEdit = false">取消</el-button>
				</span>
			</el-dialog>
			<!--分班对话框-->
			<el-dialog :visible="edit.isDevide" :show-close="false" :modal="false">
				<h3 slot="title">分班</h3>
				<el-select v-model="edit.model.stu_cls_id">
					<el-option :value="edit.model.stu_cls_id ===null" label="- 无班级 -"></el-option>
					<el-option v-for="item in classList" :label="item.cls_name" :key="item.cls_id" :value="item.cls_id" ></el-option>
				</el-select>
				<span slot="footer">
					<el-button type="primary" @click="confirmDev">确定</el-button>
					<el-button @click="edit.isDevide = false">取消</el-button>
				</span>
			</el-dialog>
			<!--头像对话框-->
			<el-dialog :visible="upload.isUpload" width="900px" :show-close="false" :modal="false">
				<h3 slot="title">照片存档</h3>
				<div class="photo">
					<div  label="学生照片" >
						<img :src="upload.model.stu_avatar_old === null ?'/images/student/1610000815615.jpg' : upload.model.stu_avatar_old "  />
						<p>学生当前存档照片</p>
					</div>
					<div>
						<!--accept:规定上传文件格式     -->
						<!--list-type:是什么形式显示的     -->
						<!--headers：自定义个token添加到ajax的头部 -->
						<!--name：服务器要求的键名是avatar  -->
						<!--action：发送ajax路径 -->
						<!--on-success：监听图片上传成功 调用对应的函数 函数  -->
						<!--on-remove :清空刚上传的图片  -->
						<!--before-upload：上传之前的准备-->
						<el-upload accept=".jpg,.png"
									list-type="picture-card"
									name="avatar"
									action="/student/avatarupload"
									:headers="uploadHeaders"
									:on-success="avatarUploadSuccess"
									:before-upload="beforeAvatarUpload"
									:on-remove="avatarRemove"
									ref="upload">
							<i class="el-icon-plus"></i>
							<p slot="tip" >提示：只能上传JPG和PNG格式，照片大小小于2M</p>
						</el-upload>

					</div>

				</div>
				<span slot="footer">
						<el-button type="primary" @click="avatarUpload">存档</el-button>
						<el-button @click="upload.isUpload =false">取消</el-button>
				</span>
			</el-dialog>
		</el-container>

	</div>
</template>

<script type="text/ecmascript-6">
	import { createNamespacedHelpers } from "vuex";
	let { mapGetters } = createNamespacedHelpers("dictionary");

        export default {
                name:"Student",
	        data(){
                        return{
                                student:[],
				studentAll:{
                                        stu_name:"",
					stu_cls_id:0,
					stu_qualification:null,

				},
	                        classList:[],
	                        selected:[],
                                stu_ids:[],
	                        edit:{
                                        isEdit:false,
		                        isDevide:false,
		                        mode:true,
		                        model:{
                                                stu_name:null,          //学生名字
			                        stu_avatar:null,               //学生照片
			                        stu_cls_id:null,                //学生所在班级id
			                        stu_sex:1,                   //学生性别
			                        stu_phone:null,                 //学生电话
			                        stu_phone2:null,                //备用电话
			                        stu_born:null,                  //出生日期
			                        stu_qualification:null,         //学生学历
			                        stu_school:"",                          //学生学校
			                        stu_major:"",                           //学生专业
			                        stu_address:null,                       //家庭住址
			                        stu_remark:"",                          //备注
			                        stu_id:null,                                     //学生id
                                                stu_ids:[],                                     //选中的学生id

		                        }
	                        },
	                        rules:{
                                        stu_name:[
	                                        {
                                                        validator :( rule,value,callback ) => {
	                                                        if( value === null )  callback( new Error(" 学生姓名不能为空 ") );
	                                                        else if( value.length <2 || value.length >6 ) callback( new Error( "学生名字的长度在2-6" ) );
	                                                        else if( this.student.findIndex( item => item.stu_name === value ) !== -1 ) callback(new Error("该名字已存在，请注意区分"));
	                                                        else callback();
	                                                },trigger:"blur"

	                                        }
                                        ],
                                        stu_phone:[
                                                {
                                                        validator :( rule,value,callback ) => {
                                                                if( value === null )  callback( new Error(" 联系电话不能为空 ") );
                                                                else if( !/^1 \d{10}$/.test(value)  ) callback(new Error("手机号为11位数字组成，且由1开头"));
                                                                else callback();
                                                        },trigger:"blur"

                                                }
                                        ],
                                        stu_phone2:[
                                                {
                                                        validator :( rule,value,callback ) => {
                                                                if( value === null )  callback( new Error(" 联系电话不能为空 ") );
                                                                else if(! /^1\d{10}$/.test(value)  ) callback(new Error("手机号为11位数字组成，且由1开头"));
                                                                else callback();
                                                        },trigger:"blur"

                                                }
                                        ],
                                        stu_address:[ { required:true,message:"家庭地址不能为空",trigger:"blur" } ],
	                        },
	                        uploadHeaders:{ "Authorization":sessionStorage.getItem("token") },
	                        upload:{
                                        isUpload:false,
		                        model:{
                                                stu_id:0,
			                        stu_avatar_old:null,
			                        stu_avatar_new:""
		                        }

	                        },
	                        pagination:{
				        total:0,
		                        pageSize:5,
		                        currentPage:1
	                        }
                        }
	        },
	        computed:{
                        ...mapGetters(["getGroupByKey"]),
	        },
	        async created(){
			this.getStudents();
			await this.$http({ url:"/class/all" })
				.then( data => this.classList = data );
	        },
	        methods:{
	                async getStudents( fromPage1 = true ){
	                        if( fromPage1 ) this.pagination.currentPage = 1;
	                        let stu = await this.$http({
		                        url:"/student/list" ,
		                        method:"post",
		                        data:{
			                        ...this.studentAll,
                                                begin: this.pagination.pageSize * (this.pagination.currentPage - 1 ) ,
			                        pageSize:this.pagination.pageSize
		                        }
	                        });
		                this.pagination.total = stu.total;
		                this.student = stu.list;
                                console.log(this.student)
	                },
                        beginAdd(){
	                        if( this.$refs.form ) this.$refs.form.resetFields();
	                        this.edit.mode = true;
                                this.edit.model.stu_name=null;        //学生名字
                                this.edit.model.stu_avatar=null;               //学生照片
                                this.edit.model.stu_cls_id=null;                //学生所在班级id
	                        this.edit.model.stu_sex=1;                   //学生性别
	                        this.edit.model.stu_phone=null;                 //学生电话
	                        this.edit.model.stu_phone2=null;                //备用电话
	                        this.edit.model.stu_born=null;                  //出生日期
	                        this.edit.model.stu_qualification=null;         //学生学历
	                        this.edit.model.stu_school="";                          //学生学校
	                        this.edit.model.stu_major="";                           //学生专业
	                        this.edit.model.stu_address=null;                       //家庭住址
	                        this.edit.model.stu_remark="";                          //备注
	                        this.edit.model.stu_id=null ;                                    //学生id
	                        this.edit.isEdit = true;
                        },
		        beginUpdate( stu ){
                                if( this.$refs.form ) this.$refs.form.resetFields();
                                this.edit.mode = false;
                                this.edit.model.stu_name=stu.stu_name;        //学生名字
                                this.edit.model.stu_avatar=stu.stu_avatar;               //学生照片
                                this.edit.model.stu_cls_id=null;                //学生所在班级id
                                this.edit.model.stu_sex=stu.stu_sex;                   //学生性别
                                this.edit.model.stu_phone=stu.stu_phone;                 //学生电话
                                this.edit.model.stu_phone2=stu.stu_phone2;                //备用电话
                                this.edit.model.stu_born=stu.stu_born;                  //出生日期
                                this.edit.model.stu_qualification=stu.stu_qualification;         //学生学历
                                this.edit.model.stu_school=stu.stu_school;                          //学生学校
                                this.edit.model.stu_major=stu.stu_major;                           //学生专业
                                this.edit.model.stu_address=stu.stu_address;                       //家庭住址
                                this.edit.model.stu_remark=stu.stu_remark;                          //备注
                                this.edit.model.stu_id=stu.stu_id;                                    //学生id
                                this.edit.isEdit = true;
		        },
		        beginDevide( row ){
		                this.edit.model.stu_name = row.stu_name;
		                this.edit.model.stu_cls_id = row.stu_cls_id;
		                this.edit.model.stu_id = row.stu_id;
		                this.edit.isDevide = true;
		        },
                        beginNum(){
		                if(this.selected.length===0) this.$message({ message:"请先选择学生",type:"warning" });
                                else this.edit.isDevide = true;
                        },
                        getRowKeys(row){
		                return row.stu_id
                        },
                        handleSelectionChange(val){
	                        this.selected = val;
                                this.edit.model.stu_ids =[];
                                val.forEach( item =>{
                                        this.edit.model.stu_ids.push( item.stu_id );
                                } );
                        },
                        async confirmDev(){
                                if( this.selected.length===0 ){
                                        await this.$http({ url:"/student/assignclass",method:"post",data:this.edit.model });
                                        this.student.find( item => item.stu_id ===this.edit.model.stu_id ).stu_cls_id = this.edit.model.stu_cls_id;
                                        this.$message({ message:`对"${ this.edit.model.stu_name }"开班操作成功`,type:"success" })
                                }else  if( this.selected.length===1 ){
				        this.edit.model.stu_id = this.selected[0].stu_id;
				        await this.$http({ url:"/student/assignclass",method:"post",data:this.edit.model });
				        this.student.find( item => item.stu_id ===this.edit.model.stu_id ).stu_cls_id = this.edit.model.stu_cls_id;
				        this.$message({ message:"开班成功",type:"success" })
				}else{
					this.edit.model.stu_id = null;
                                        await this.$http({ url:"/student/assignclass",method:"post",data:this.edit.model });
                                        this.edit.model.stu_ids.forEach( item => {
                                                this.student.find( item2 => item2. stu_id === item ).stu_cls_id = this.edit.model.stu_cls_id;

                                        } );
                                        this.$message({ message:"批量分班成功",type:"success" });
				}
				this.edit.isDevide = false;
                        },
		        async save(){
                                this.$refs.form.validate( async valid => {
                                        if( !valid ) return;
                                        if( this.edit.mode ){
                                                this.edit.model.stu_id = await this.$http({ url:"/student/add",method:"post",data:this.edit.model });
                                                this.student.push( Object.assign( {},this.edit.model ) );
                                                this.$message({ message:"添加成功",type:"success" })
                                        }else{
                                                await this.$http({ url:"/student/update",method:"post",data:this.edit.model });
                                                let i = this.student.findIndex( item => item.stu_id === this.edit.model.stu_id );
                                                this.student.splice( i,1,Object.assign({},this.edit.model) );
                                                this.$message({ message:"修改成功",type:"success" })
                                        }
                                        this.edit.isEdit = false;
                                } );


		        },
		        //开始上传
		        beginUpload( upload ){
		                console.log(upload)
		                this.upload.model.stu_id = upload.stu_id;
                                this.upload.model.stu_avatar_new = "";
                                this.upload.model.stu_avatar_old = upload.stu_avatar;
		                this.upload.isUpload = true;

		        },
                        beforeAvatarUpload( file ){
		                const isJPG = file.type === 'image/jpeg';
		                const isPNG = file.type === 'image/png';
		                const isLt2M =file.size/1024/1024 < 2;
		                if( ( !isJPG )&&( !isPNG ) ){
		                        this.$message.error('上传头像图片只能是JPG或PNG格式')
		                }
		                if( !isLt2M ) {
		                        this.$message.error( '上传头像图片大小不能超过2M' )
		                }
		                return( isJPG || isPNG ) && isLt2M;
                        },
		        //上传成功以后的钩子函数
                        avatarUploadSuccess( { status,data,message },file,fileList ){
		                switch(status){
			                case 200:
			                        this.upload.model.stu_avatar_new = data;
			                        if( fileList.length >1 ) fileList.shift();
			                        break;
			                case 401:
			                case 404:
			                case 199:
			                case 500:
			                        this.$message.error(message)
		                }
                        },
		        //删除上传的图片，清空model的new
                        avatarRemove( file,fileList ){
                                this.upload.model.stu_avatar_new = "";
                        },
                        async avatarUpload(){
                                this.student.find(  item => item.stu_id === this.upload.model.stu_id).stu_avatar =  await this.$http({ url:"/student/avatarupdate",method:"post",data:this.upload.model });
                                this.$message({ message:"头像上传更新成功",type:"success" });
                                this.upload.isUpload = false;
                                this.$refs.upload.clearFiles();
                        }

	        }
        };
</script>

<style scoped>
	.el-container{
		position: absolute;
		top:0;
		left:0;
		height: 100%;
		width:99%;
	}
	.el-header{
		width:1350px;
	}
	.haveNoClass{
		color: #ddd;
	}
	.photo{
		display: flex;
	}
</style>