<template>
	<div >
		<div class="logo-wrapper">
			<h1>工商管理系统</h1>
		</div>
		<el-form :rules="rules" ref="model" :model="model" status-icon>
			<h2>登录工商管理账号</h2>
			<el-form-item prop="user_name">
				<el-input suffix-icon="el-icon-s-custom" v-model="model.user_name">
					<template slot="prepend"><span class="prependText">用户名</span></template>
				</el-input>
			</el-form-item>
			<el-form-item prop="user_pwd">
				<el-input type="password" suffix-icon="el-icon-lock" v-model="model.user_pwd">
					<template slot="prepend"><span class="prependText">密 &nbsp 码</span></template>
				</el-input>
			</el-form-item>
			<el-form-item>
				<el-button plain @click="login( 'model' )">登录</el-button>
				<el-button plain  @click="resetForm">重置</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script type="text/ecmascript-6">
	export default{
	        name:"Login",
		data(){
	                return {
	                        model:{
	                                user_name:"",
		                        user_pwd:""
	                        },
                                rules:{
                                        user_name:[
						{ required:true,message : "请输入用户名",trigger :"blur" },
						{ min:5,max:20,message:"长度在5-20个字符",trigger:"blur" }
					],
                                        user_pwd:[
		                                { required:true,message:"请输入密码",trigger:"blur" },
                                                { min:3,max:6,message:"长度在3-6个字符",trigger:"blur" }
	                                ]
                                }
	                }

		},
		methods:{
		         login( name ){
		                this.$refs[name].validate( async valid  => {
		                        if( valid ){
                                                let token = await this.$http({
                                                        method:"post",
                                                        url:"/user/login",
                                                        data:this.model
                                                });
                                                sessionStorage.setItem( "token",token );
                                                sessionStorage.setItem( "user_name",this.model.user_name );
                                                this.$router.replace("/home");
		                        }else{
		                                return false;
		                        }
			        })

		        },
			resetForm(){
				this.$refs.model.resetFields();
			}
		}
	};
</script>

<style scoped>
	@keyframes aaa{
		0%{ transform:rotateY(0deg) }
		100%{ transform:rotateY(30deg) }
	}
	@keyframes bbb{
		0%{ transform:translateY(-60%) translateX(0%) }
		100%{ transform:translateY(-60%) translateX(25%) }
	}
	.logo-wrapper{
		perspective: 500px;
		position: fixed;
		top:50%;;
		right:50%;
		transform:translateY(-60%) translateX(0%);
		animation-name:bbb;
		animation-duration:1s;
		animation-fill-mode:forwards;
		animation-delay:1s;
	}
	h1{
		animation-name:aaa;
		animation-duration:1s;
		animation-fill-mode:forwards;
		white-space:nowrap;
		transform-origin:left center;
		transform:rotateY(45deg) ;
		font-size:80px;
		text-shadow: -10px -5px 10px #000;
		padding:20px 50px;
		border-bottom:1px solid #000;
		color:#b0b0b0;
		position:relative;
	}

	h2{
		color:#b0b0b0;
		margin-bottom:20px;
	}
	.el-form{
		position: fixed;
		top:20%;
		left:50%;
		border:1px solid #b0b0b0;
		width:300px;
		padding:50px 60px;
		box-shadow:0 0 10px 1px #888888;
		display:flex;
		flex-direction: column;
		align-items: center;
	}
	.prependText{
		width:100px;
	}
</style>