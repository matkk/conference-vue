<template>
  <div>
    <el-container style="height: auto; border: 1px solid #eee; margin-top:0px;">
      <el-header style="text-align: center; font-size: 12px">
        <span></span>
      </el-header>
      <el-container :style="{height: mainHeight}">
<!--        <el-aside width="200px" style="background-color: rgb(238, 241, 246)">-->
<!--          <el-menu :default-openeds="['1', '3']">-->
<!--            <el-submenu index="1">-->
<!--              <template slot="title"><i class="el-icon-message"></i>导航一</template>-->
<!--            </el-submenu>-->
<!--            <el-submenu index="3">-->
<!--              <template slot="title"><i class="el-icon-setting"></i>导航三</template>-->
<!--            </el-submenu>-->
<!--          </el-menu>-->
<!--        </el-aside>-->
        <el-main>
          <el-row>
            <el-col :span="24">
              <div style="padding: 10px 0;text-align: left;">
                <el-radio-group v-model="radio1">
                  <el-radio-button label="MSD-C3-703会议室"></el-radio-button>
                </el-radio-group>
                <el-date-picker
                  v-model="selectDate"
                  value-format="yyyy-MM-dd"
                  align="right"
                  type="date"
                  placeholder="选择日期"
                  @change="changeDate">
                </el-date-picker>
              </div>
            </el-col>
          </el-row>
          <full-calendar :config="config" :events="events" ref="calendar"></full-calendar>
        </el-main>
      </el-container>
    </el-container>
    <el-dialog :title=dialogTitle :visible.sync="dialogFormVisible" width="500px">
      <el-form :model="calForm" ref="calForm" :rules="rules" >
        <el-form-item label="预约日期" :label-width="formLabelWidth" prop="calDate">
          <el-date-picker  style="float: left;width: 170px;" :disabled=disabled
            v-model="calForm.calDate"
            align="right"
            type="date"
            placeholder="选择日期"
            :picker-options="pickerOptions">
          </el-date-picker>
        </el-form-item>

        <el-form-item label="预约时间" :label-width="formLabelWidth" required style="text-align: left;margin-bottom: 0px;">
          <el-col :span="11">
            <el-form-item prop="start">
              <el-time-select :disabled=disabled
                placeholder="起始时间" style="width: 100%;"
                v-model="calForm.start"
                :picker-options="{
                start: '08:00',
                step: '00:30',
                end: '23:30'
              }">
              </el-time-select>
            </el-form-item>
          </el-col>
          <el-col :span="2" style="text-align: center">-</el-col>
          <el-col :span="11">
            <el-form-item prop="end">
              <el-time-select :disabled=disabled
                placeholder="结束时间" style="width: 100%;"
                v-model="calForm.end"
                :picker-options="{
                start: '08:00',
                step: '00:30',
                end: '23:30',
                minTime: calForm.start
              }">
              </el-time-select>
            </el-form-item>
          </el-col>
        </el-form-item>
        <el-form-item label="标题" :label-width="formLabelWidth" prop="title">
          <el-input v-model="calForm.title" placeholder="请输入内容" :disabled=disabled></el-input>
        </el-form-item>
        <el-form-item label="申请人" :label-width="formLabelWidth" prop="author">
          <el-input v-model="calForm.author" placeholder="请输入内容" :disabled=authorDisabled></el-input>
        </el-form-item>
        <el-form-item label="备注" :label-width="formLabelWidth" prop="remark">
          <el-input v-model="calForm.remark" :disabled=disabled></el-input>
        </el-form-item>
        <el-form-item prop="id" style="height: 0">
          <el-input type="hidden" v-model="calForm.id" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="edit" v-show=editVisible>修 改</el-button>
        <el-button type="primary" @click="submit" v-show=submitVisible>提 交</el-button>
<!--        <el-button type="danger" v-show=delVisible  @click="delete">删 除</el-button>-->
        <el-popconfirm title="确定删除？" v-show=delVisible @confirm="deleteCal" style="margin-left: 10px;">
          <el-button slot="reference" type="danger">删除</el-button>
        </el-popconfirm>
      </div>
    </el-dialog>
  </div>
</template>
<script src="http://pv.sohu.com/cityjson?ie=utf-8"></script>
<script>
import { FullCalendar } from 'vue-full-calendar'
import "fullcalendar/dist/fullcalendar.css";
import ElementUI from "_element-ui@2.15.5@element-ui";
import moment from "moment";

export default {
  components: { FullCalendar,ElementUI },
  data() {
    const checkEnd = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择结束时间'));
      }
      setTimeout(() => {
        if (moment("2020-02-02 "+value+":00").format("HH:mm:ss")<=moment("2020-02-02 "+this.calForm.start+":00").format("HH:mm:ss")) {
          callback(new Error('结束时间必须大于起始时间'));
        }
        else{
          callback();
        }
      }, 1000);
    };
    const item = {
      date: '2016-05-02',
      name: '王小虎',
      address: '上海市普陀区金沙江路 1518 弄'
    };
    return {
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      selectOptions:{
        step: '00:30'
      },
      ip: '',
      calForm: {
        calDate: '',
        start: '',
        end: '',
        title: '',
        author: '',
        remark: ''
      },
      rules: {
        calDate: [
          { required: true, message: '请选择预约日期', trigger: 'blur' }
        ],
        start: [
          { required: true, message: '请选择起始时间', trigger: 'blur' }
        ],
        end: [
          { trigger: 'blur', validator: checkEnd }
        ],
        title: [
          { required: true, message: '请输入标题', trigger: 'blur' },
          { min: 0, max: 120, message: '长度在 0 到 120 个字符', trigger: 'blur' }
        ],
        author: [
          { required: true, message: '请输入申请人', trigger: 'blur' },
          { min: 0, max: 120, message: '长度在 0 到 120 个字符', trigger: 'blur' }
        ],
        remark: [
          { min: 0, max: 120, message: '长度在 0 到 120 个字符', trigger: 'blur' }
        ]
      },
      formLabelWidth: '80px',
      radio1: 'MSD-C3-703会议室',
      dialogFormVisible: false,
      editVisible: false,
      submitVisible: true,
      delVisible: false,
      disabled:false,
      authorDisabled:false,
      dialogTitle: "新增预约",
      clientHeight: document.documentElement.clientHeight,
      mainHeight: null,
      tableData: Array(20).fill(item),
      selectDate:'',//日期选择器选中的月份
      events: {},
      config: {
        firstDay:'0',//以周日为每周的第一天
        buttonText: { today: "今天", month: "月", week: "周", day: "日" },
        header: {left:'today', center: 'prev, title, next'},
        theme:false,//是否允许使用jquery的ui主题
        // height:200,
        slotLabelFormat:'H:mm', // axisFormat 'H(:mm)'
        fixedWeekCount:false,
        eventLimitText:"查看所有",
        //weekMode:'fixed',在月视图里显示周的模式，因为每月周数可能不同，所以月视图高度不一定。
        // weekNumbers:true,//是否在日历中显示周次(一年中的第几周)，如果设置为true，则会在月视图的左侧、周视图和日视图的左上角显示周数。
        //slotLabelInterval:1,
        views: {
          month: {
            titleFormat: 'YYYY年MMM'
          },
          day: {
            titleFormat: 'YYYY年MMMDD日 dddd'
          }
        },
        monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        monthNamesShort: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
        dayNames: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        dayNamesShort: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"],
        slotDuration:'00:30:00',
        minTime:'00:00',
        maxTime:'24:00',
        locale: "zh-cn",
        editable: false, //是否允许修改事件
        selectable: false,//是否允许用户单击或者拖拽日历中的天和时间隙
        eventLimit: 5, // 限制一天中显示的事件数，默认false
        allDaySlot:true, //是否显示allDay
        displayEventEnd: false,//是否显示结束时间
        allDayText: '全天',
        navLinks: true, //允许天/周名称是否可点击
        defaultView: "month", //显示默认视图
        eventClick: this.eventClick, //点击事件
        dayClick: this.dayClick, //点击日程表上面某一天
        eventRender: this.eventRender
      }
    }
  },
  created() {
    this.initHeight();
    this.loadCalendar();
  },
  mounted() {
    window.onresize = () => {
      this.clientHeight = document.documentElement.clientHeight;
      this.initHeight();
    };
    this.ip = localStorage.getItem('Ip')

    //this.mainHeight = '500px';//window.innerHeight - 30;
    // const _this = this;
    // window.onresize = () => {
    //   return (() => {
    //     // 可以在这里保存到浏览器中，也可以保存到其他地方
    //     // window.height = document.documentElement.clientHeight;
    //     // _this.height = window.height;
    //     _this.height = `${document.documentElement.clientHeight}`;
    //   })();
    // };
  },
  watch: {
    clientHeight(newValue, oldValue) {
      if (newValue) {
        console.log(this.clientHeight);
      }
    }
  },
  methods: {
    initHeight(){
      this.mainHeight = (this.clientHeight-70)+'px';
      this.config.height = this.clientHeight-170;
    },
    changeDate(){
      this.$refs.calendar.fireMethod('gotoDate', this.selectDate)
    },
    // 点击当天
    dayClick (day, jsEvent) {
      if(moment(day._d).format('YYYY-MM-DD')<moment().format('YYYY-MM-DD')){
        return false;
      }
      this.disabled = false;
      this.authorDisabled = false;
      this.editVisible = false;
      this.submitVisible = true;
      this.delVisible = false;
      this.dialogTitle = "新增预约",
      this.dialogFormVisible = true;
      // this.$refs.calForm.resetFields();
      this.$nextTick(()=>{
        // this.$refs.calForm.resetFields();
        this.$refs.calForm.clearValidate();
      })
      this.calForm={};
      this.$set(this.calForm,'calDate', moment(day._d).format('YYYY-MM-DD'));
      // this.calForm.title=moment(day._d).format('YYYY-MM-DD');
    },
    // 点击事件
    eventClick (event, jsEvent, pos) {
      this.disabled = true;
      this.authorDisabled = true;
      event.start = event.start.format('HH:mm');
      event.end = event.end.format('HH:mm');
      delete event["className"];
      delete event["source"];
      this.calForm=event;
      this.dialogTitle = "查看预约";
      this.dialogFormVisible = true;
      this.$nextTick(()=>{
        this.$refs.calForm.clearValidate();
      })
      if(event.ip == this.ip && event.calDate>=moment().format('YYYY-MM-DD')){
        this.editVisible = true;
        this.delVisible = true;
        this.submitVisible = false;
      }else{
        this.editVisible = false;
        this.delVisible = false;
        this.submitVisible = false;
      }
    },
    edit(){
      this.disabled = false;
      this.authorDisabled = true;
      this.editVisible = false;
      this.submitVisible = true;
      this.dialogTitle = "修改预约";
    },
    eventRender:function (event, element) {
      //element.find('.fc-title').attr('title',event.title)
    },
    loadCalendar() {
      // this.openFullScreen(2000);
      this.$axios.get('/calendar').then(resp => {
        if (resp && resp.status === 200) {
          const result = resp.data.result;
          result.forEach(item => {
            item.start=item.calDate+" "+item.start;
            item.end=item.calDate+" "+item.end;
            if(item.start<=item.calDate+" 12:00:00"){
              item.backgroundColor="#19be6b";
              item.borderColor="#19be6b";
            }
          });
          this.events =result;
        }
      })
    },
    submit(){
      this.$refs.calForm.validate((valid) => {
        if (valid) {
          const form = this.calForm;
          form.calDate = moment(form.calDate).format("YYYY-MM-DD");
          form.ip = this.ip;
          this.$axios.post('/calendar', form).then(resp => {
            if (resp && resp.status === 200) {
              if(resp.data.code === 200){
                this.dialogFormVisible = false;
                this.$message({
                  message: '操作成功！',
                  type: 'success'
                });
                this.loadCalendar();
              }else{
                this.$message.error(resp.data.message);
              }

            }
          });
        }else{
          this.$message.error('数据有误，请重新填写！');
          return false;
        }
      });
    },
    deleteCal(){
        const id = this.calForm.id;
        console.log(id)
        this.$axios.get('/calendar/delete/'+id).then(resp => {
          if (resp && resp.status === 200) {
            this.dialogFormVisible = false;
            this.$message({
              message: '删除成功！',
              type: 'success'
            });
            this.loadCalendar();
          }
        });
    },
    openFullScreen(time) {
      const loading = this.$loading({
        lock: true,
        text: 'Loading',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      setTimeout(()=>loading.close() , time)
    }
  }
}
</script>

<style>
.el-header {
  background-color: #B3C0D1;
  color: #333;
  line-height: 60px;
}

.el-aside {
  color: #333;
}
</style>
