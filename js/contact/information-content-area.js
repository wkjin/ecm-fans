var information = {
    _options: {
        company_latitude_longitude: '120.322356|30.152879',
        company_name: '杭州浩沅科技有限责任公司',
        telephone: '0571-82356956',
    },

    isCanLoadMap: true,//是否能够加载地图
    loadMapTime: 200,//检测地图接口是否就绪的脉搏（单位：毫秒）
    
    //异步加载地图的api
    loadBMapScript: function () {
        if(!this.isCanLoadMap) return;//只有能够加载地图的时候才加载
        var scriptId = 'component-map';
        var script = document.getElementById(scriptId);
        var mapUrl = 'http://api.map.baidu.com/api?v=2.0&ak=&callback=e';
        if(script){
            script.parentElement.removeChild(script);//移除掉原本的javascipt
        }
        script = document.createElement('script');
        script.id = scriptId;
        script.src = mapUrl;
        document.head.appendChild(script);
    },

    //调用地图进行初始化地图，并设置地图
    loadBaiduMap: function(){
        var self = this;
        console.log(self, '================>>>>', self._options['company_name']);
        var company_name = self._options.company_name;
        var telephone = self._options.telephone;
        var zoom = 18;
        var points = self._options.company_latitude_longitude;

        if(!self.isCanLoadMap) return;//只有能够加载地图的时候才加载
        //==============   1、由于无法接收到回调函数，启动脉搏进行手动检测   ===================
        if(typeof(BMap) === 'undefined' || typeof(BMap.Map) ==='undefined'){
            console.log("地图服务还没有完全加载，正在加载...，等待时间：%dms",this.loadMapTime);
            self.loadMapTime *= 1.5;//脉搏逐渐减弱
            if(self.loadMapTime > 10000){//如果还没有加载出来，那么可能是网络错误
                self.loadBMapScript();
                self.loadMapTime = 500;//重置等待事件
            }
            setTimeout(self.loadBaiduMap,self.loadMapTime);
            return;
        }
        //==============  2、使用的数据整理   ==============================================
        if(!Array.isArray(points)){
            var p = points;
            points = [];
            points.push(p);
        };
        
        //标注点数组
        var markerArr = [];
        if(points.length <=0 ){
            console.error('公司地图初始化数据不合法');
            this.loadMapTime *= 1.5;
            setTimeout(this.loadBaiduMap,this.loadMapTime);
            return;
        }
        for(var point of points){
          markerArr.push({
              title: company_name,
              content:"电话："+ telephone,
              point: point,
              isOpen:0,
              icon:
                  {
                      w:21,
                      h:21,
                      l:0,
                      t:0,
                      x:6,
                      lb:5
                  }
          });
        }
        var mapDateArr = {
            //初始化地图的数据
            initData : {
                point : points[0],
                zoom : zoom,
            }
        }

        //==============  2、创建地图实例   ================================================
        var initData = mapDateArr.initData;
        //在百度地图容器中创建一个地图,并设定地图的中心点和坐标并将地图显示在地图容器中
        var map = new BMap.Map("map-content");
        console.log(map, initData,'==============');
        map.centerAndZoom(new BMap.Point(...initData.point.split("|")),initData.zoom);

        //==============  3、设置地图控件与事件   ==========================================
        //地图事件函数
        map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
        map.enableScrollWheelZoom();//启用地图滚轮放大缩小
        map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
        map.enableKeyboard();//启用键盘上下左右键移动地图
        //地图控件添加函数
        map.addControl(new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE}));//向地图中添加缩放控件
        map.addControl(new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:1}));//向地图中添加缩略图控件
        map.addControl(new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT}));//向地图中添加比例尺控件



        //==================  4、创建marker   =============================================

        for(var i=0;i<markerArr.length;i++){
            var json = markerArr[i];
            var point = new BMap.Point(...json.point.split("|"));
            var iconImg = createIcon(json.icon);
            var marker = new BMap.Marker(point,{icon:iconImg});
            var label = new BMap.Label(json.title,{"offset":new BMap.Size(json.icon.lb-json.icon.x+10,-20)});
            label.setStyle({
                borderColor:"#808080",
                color:"#333",
                cursor:"pointer"
            });
            marker.setLabel(label);
            addPopUp(i,marker,json);
            map.addOverlay(marker);
            marker = null;
        }

        function addPopUp(index,marker,json){
            var _iw = createInfoWindow(index);
            var _marker = marker;
            _marker.addEventListener("click",function(){
                this.openInfoWindow(_iw);
            });
            _iw.addEventListener("open",function(){
                _marker.getLabel().hide();
            })
            _iw.addEventListener("close",function(){
                _marker.getLabel().show();
            })
            label.addEventListener("click",function(){
                _marker.openInfoWindow(_iw);
            })
            if(!!json.isOpen){
                label.hide();
                _marker.openInfoWindow(_iw);
            }
        }

        //创建InfoWindow
        function createInfoWindow(i){
            var json = markerArr[i];
            var iw = new BMap.InfoWindow("<b class='iw_poi_title' title='" + json.title + "'>" + json.title + "</b><div class='iw_poi_content'>"+json.content+"</div>");
            return iw;
        }
        //创建一个Icon
        function createIcon(json){
            var icon = new BMap.Icon(
                    "http://map.baidu.com/image/us_mk_icon.png",
                    new BMap.Size(json.w,json.h), {
                        imageOffset: new BMap.Size(-json.l,-json.t),
                        infoWindowOffset:new BMap.Size(json.lb+5,1),
                        offset:new BMap.Size(json.x,json.h)
                    }
                );
            return icon;
        }
    },

    init: function(options){
        var self = this;
        Object.assign(self._options, options);
        self.loadBMapScript();
        self.loadBaiduMap();
    }    
};

$(function(){
    $('.content-area').load('./tpl/contact/information-content-area.html', function(){
        information.init();        
    });
});
