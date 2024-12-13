<template>
    <div>
        <h2>Please enter password</h2>
        <input v-model="password" type="password" placeholder="Please enter password" />
        <button @click="submit" :disabled='loading' :class="{ loading }">
            {{ loading ? '正在加密...' : '确认' }}
        </button>
        <button @click="$emit('cancel')">取消</button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
</template>

<script>
    export default{
        props:{
            onSubmit:{
                type:Function,
                required:true
            },
            onCancel:{
                tyep:Function,
                required:true
            },
            loading:{
                type:Boolean,
                default:false
            }
        },
        data(){
            return{
                password:'',
                error:''
            };
        },
        methods:{
            async submit(){
                console.log(this.password);
                if(!this.password){
                    this.error = 'password null';
                    return;
                }

                try{
                    await this.onSubmit(this.password);
                    this.error = '';
                } catch (err) {
                    this.error = err.message || '未知错误';
                }
            }
        }
    }
</script>