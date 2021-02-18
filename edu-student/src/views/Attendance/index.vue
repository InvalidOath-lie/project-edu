<template>
	<div>
		这是考勤组件
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
			<p slot="tip">提示：只能上传JPG和PNG格式</p>
		</el-upload>
		<el-button  type="primary" :disabled="upload.model.stu_avatar_new ===''" @click="avatarUpload">确定</el-button>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name:"Attendance",
	        data(){
                        return{
                                uploadHeaders:{ "Authorization":sessionStorage.getItem("token") },
	                        upload:{
                                        isUpload:false,
                                        model:{
                                                stu_id:0,
                                                stu_avatar_old:null,
                                                stu_avatar_new:""
                                        }

	                        }
                        }
	        },
	        methods:{
                        beforeAvatarUpload(file) {
                                const isJPG = file.type === 'image/jpeg';
                                const isPNG = file.type === 'image/png';
                                const isLt2M = file.size / 1024 / 1024 < 2;

                                if ((!isJPG) && (!isPNG)) {
                                        this.$message.error('上传头像图片只能是 JPG 或 PNG格式!');
                                }
                                if (!isLt2M) {
                                        this.$message.error('上传头像图片大小不能超过 2MB!');
                                }
                                return (isJPG || isPNG) && isLt2M;
                        },
		        //上传成功以后的钩子函数
                        avatarUploadSuccess( { status,data,message },file,fileList ){   //服务器的回应，上传的文件，已上传的文件列表
                                switch(status){
	                                case 200:
	                                        console.log(fileList);
	                                        this.upload.model.stu_avatar_new = data;
	                                        if(fileList.length >1 ) fileList.shift();
	                                        break;
	                                case 401:
	                                case 404:
	                                case 199:
	                                case 500:
	                                        this.$message.error(message)
                                }
                        },
                        avatarRemove( file,fileList ){
                                this.upload.model.stu_avatar_new = "";
                        },
                        async avatarUpload(){
                                await this.$http({ method:"post",url:"/student/avatarupdate",data:this.upload.model });
                                this.$message({ message:"头像上传更新成功",type:"success" });
                                this.upload.isUpload = false;                   //关闭上传头像对话框
                                this.$refs.upload.clearFiles();                    //重置上传控件，为下一次上传做准备
                        }
	        }
        };
</script>

<style scoped>

</style>