<template>
	<div class="container">
		<div class="flex">
			<div class="null">空闲</div>
			<div class="notNull">使用</div>
		</div>
		
		<el-row :gutter="20">
			<el-col :span="6" v-for="item in list" :key="item.clsr_name">
				<el-card :class="{isNull: item.clsr_occupy === 0}">
					<span v-text="item.clsr_name"></span>
					<div class="edit">
						<i class="el-icon-edit" @click="beginUpdate( item )"></i>
						<i class="el-icon-delete" v-show="item.clsr_occupy===0" @click="remove( item.clsr_id )"></i>
					</div>

				</el-card>
			</el-col>
			<el-col :span="6" >
				<el-card class="addBtn" @click.native="beginAdd">
					<i class="el-icon-plus"></i>
				</el-card>
			</el-col>
		</el-row>
		<el-dialog :visible="isShow" title="添加班级" :show-close="false" :modal="false" :fullscreen="false">
			<el-form ref="form" :model="classroom" :rules="rules" status-icon>
				<el-form-item label="班级" prop="clsr_name">
					<el-input v-model="classroom.clsr_name"></el-input>
				</el-form-item>
				<span class="footer">
					<el-button type="primary" @click="save">确定</el-button>
					<el-button @click="isShow=false">取消</el-button>
				</span>
			</el-form>
		</el-dialog>
	</div>
</template>

<script type="text/ecmascript-6">
	import { createNamespacedHelpers } from "vuex";
	let { mapState } = createNamespacedHelpers("classroom");

        export default {
                name:"Classroom",
	        data(){
                        return{
                                isShow:false,
	                        roomList:[],
	                        mode:true,
				classroom:{
				        clsr_name:"",
					clsr_id:0
				},
	                        rules:{
                                        clsr_name:[
	                                        {
	                                                validator:(rule,value,callback) => {
	                                                        if( value ==="" ) callback( new Error( "教室名称不能为空" ) );
	                                                        else if( this.roomList.findIndex( item => item.clsr_name === value ) ) callback( new Error( "该教室名已存在" ) );
	                                                        else callback();

	                                                },trigger:"blur"
	                                        }
	                                 ]
	                        }
                        }
	        },
	        computed:{
                        ...mapState(["list"])
	        },
	        async created(){
			await this.$store.dispatch("classroom/getClassroom");
			console.log(this.list)
	        },
	        methods:{
	                beginAdd(){
	                         if( this.$refs.form ) this.$refs.form.resetFields();
	                        this.isShow = true;
	                        this.classroom.clsr_name = "";
	                },
		        beginUpdate( room ){
	                        if( this.$refs.form ) this.$refs.form.resetFields();
                                this.isShow = true;
                                this.classroom.clsr_id = room.clsr_id;
                                this.classroom.clsr_name = room.clsr_name;
                                this.mode = false;
		        },
		        remove( id ){
	                        this.$confirm( "确定删除？","提示",{ type:"warning" } )
		                        .then( async () => {
						await this.$store.dispatch( "classroom/removeClassroom",id );
                                                this.$message({ message:"删除成功",type:"success" });
		                        } )

		        },
		        save(){
		                this.$refs.form.validate( valid => {
		                        if( !valid ) return;
                                        if( this.mode ){
                                                this.$store.dispatch( "classroom/addClassroom" , Object.assign({},this.classroom));
                                                this.isShow = false;
                                                this.$message({ message:"添加成功",type:"success" });
                                        }else{
                                                this.$store.dispatch( "classroom/updateClassroom",this.classroom );
                                                this.$message({ message:"修改成功",type:"success" });
                                        }
                                        this.isShow = false;
		                } );

		        }
	        }
        };
</script>

<style scoped>
	.container{
		width:100%;;
		height:100%;
	}
	.el-card{
		padding: 10% 0;
		text-align: center;
		background-color: #E6A23C;
		color: #fff;
		margin-top: 15px;
		cursor: pointer;
		position: relative;
	}
	.el-card.isNull{
		background-color: #67C23A;
	}
	.addBtn{
		color: #000;
		background-color:#fff;
	}
	.flex{
		width:150px;
		display: flex;
		justify-content:space-around;
	}
	.null{
		width:40px;
		height: 40px;
		color: #fff;
		text-align: center;
		line-height:40px;
		background-color: #67C23A;
	}
	.notNull{
		width:40px;
		height: 40px;
		color: #fff;
		text-align: center;
		line-height:40px;
		background-color: #E6A23C;
	}
	.edit{
		position: absolute;
		right:20px;
		bottom:10px;
	}
</style>














