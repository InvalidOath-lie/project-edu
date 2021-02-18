<template>
	<div>
		<el-form ref="form" label="right" class="password" label-width="100px"  :model="model" :rules="rules" status-icon>
			<el-form-item label="原始密码：" prop="oldPwd">
				<el-input placeholder="请输入原始密码"  v-model="model.oldPwd"></el-input>
			</el-form-item>
			<el-form-item label="新密码" prop="newPwd">
				<el-input placeholder="请输入新密码"  v-model="model.newPwd"></el-input>
			</el-form-item>
			<el-form-item label="确认密码"  prop="confirm_new">
				<el-input placeholder="请确认密码"  v-model="model.confirm_new"></el-input>
			</el-form-item>
			<el-form-item>
				<el-button type="primary" @click="confirm">确定</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script type="text/ecmascript-6">
        export default {
                name: "changePassword",
                data() {
                        return {
				model:{
                                        oldPwd:"",
                                        newPwd:"",
					confirm_new:""
				},
	                        rules:{
                                        oldPwd:[
	                                        { required:true,message:"原始密码必须填",trigger:"blur" }
                                        ],
                                        newPwd:[
                                                {
                                                        validator:( rule,value,callback ) => {
                                                                if( value === this.model.oldPwd ) callback( new Error("新密码不能与旧密码相同"));
                                                                else if( value === "" ) callback( new Error( "新密码不能为空" ) );
                                                                else callback();
                                                        },trigger:"blur"
                                                }
                                        ],
                                        confirm_new:[
                                                {
                                                        validator:( rule,value,callback ) => {
                                                                if( value !== this.model.newPwd ) callback( new Error("确定密码必须与新密码相同"));
                                                                else if( value === "" ) callback( new Error( "确认密码不能为空" ) );
	                                                        else callback();
                                                        },trigger:"blur"
                                                }
                                        ]
	                        }
                        }
                },
	        methods:{
                        confirm(){
                                this.$refs.form.validate( async valid => {
                                        if( !valid ) return ;
                                        await this.$http({ url:"/user/pwdchange",method:"post" ,data:this.model});
	                                this.$alert( "密码修改成功，请重新登录","提示",{
	                                        confirmButtonText:"确定",
		                                type:"warning",
		                                callback: () => {
                                                        this.$router.replace("/login");
		                                }
	                                });
                                } )
                        }
	        }

        };
</script>

<style scoped>
	.password{
		width:450px;
	}
</style>