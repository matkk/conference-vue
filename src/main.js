// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import {Loading} from 'element-ui'

const axios = require('axios');
axios.defaults.baseURL = 'http://localhost:8081/api'
Vue.prototype.$axios = axios
Vue.config.productionTip = false
Vue.use(ElementUI, { size: 'small', zIndex: 3000 });

let loading;
//内存中正在请求的数量
let loadingNum=0;
function startLoading() {
  console.log(loadingNum)
  if(loadingNum==0){
    loading = Loading.service({
      lock: true,
      text: '拼命加载中...',
      background:'rgba(255,255,255,0.5)',
    })
  }
  //请求数量加1
  loadingNum++;
}
function endLoading() {
  //请求数量减1
  loadingNum--
  if(loadingNum<=0){
    loading.close();
  }
}

//请求数据拦截器
axios.interceptors.request.use(request => {
  startLoading();
  return request
}, err => {
  return Promise.reject(err);
});


//接收响应拦截器
axios.interceptors.response.use(response => {
  endLoading();
  return response
}, err => {
  endLoading();
  if (err && err.response) {
    switch (err.response.status) {
      case 400: this.$message('请求错误(400)'); break;
      // case 401: this.$router.push('/'); break;
      case 403: this.$message('拒绝访问(403)'); break;
      case 404: this.$message('请求出错(404)'); break;
      case 408: this.$message('请求超时(408)'); break;
      case 500: this.$message('服务器错误(500)'); break;
      case 501: this.$message('服务未实现(501)'); break;
      case 502: this.$message('网络错误(502)'); break;
      case 503: this.$message('服务不可用(503)'); break;
      case 504: this.$message('网络超时(504)'); break;
      case 505: this.$message('HTTP版本不受支持(505)'); break;
      default: this.$message(`连接出错(${err.response.status})!`);
    }
  } else {
    this.$message('连接服务器失败！');
  }
  this.$message(err.message);
  return Promise.reject(err);
});

new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
  data: {
    eventHub: new Vue()
  }
})


