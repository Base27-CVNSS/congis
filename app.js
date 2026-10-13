/* CỒN GIS · Research atlas, 2026. Source of reported metrics: Viện Kỹ thuật Biển,
   2025BTE_BCTH_Connoivensong.pdf, printed pp. 251–253.
   Site positions below are *approximate place-name navigation only*, not survey measurements. */
"use strict";

const SITES = [
  {id:"phu-da", name:"Cồn Phú Đa", river:"Sông Cổ Chiên · Chợ Lách", lon:106.160, lat:10.151, risk:"erosion", summary:"Xói lở thuộc nhóm nổi bật; vận tốc có thể gần 2 m/s, xói lở có thể tới 2 m/năm.", erosion:2, velocity:2, qualifier:"Giá trị xấp xỉ / kịch bản theo kết luận báo cáo"},
  {id:"con-lac", name:"Cồn Lác", river:"Sông Cổ Chiên · Bến Tre", lon:106.258, lat:10.128, risk:"erosion", summary:"Khu vực được xác định xói lở chiếm ưu thế; vận tốc có thể đạt 1,4 m/s, xói lở 1 m/năm.", erosion:1, velocity:1.4, qualifier:"Giá trị có thể xảy ra theo kết luận báo cáo"},
  {id:"tien-loi", name:"Cù lao Tiên Lợi", river:"Sông Ba Lai · Bến Tre", lon:106.535, lat:10.284, risk:"erosion", summary:"Xói lở chiếm ưu thế; vận tốc có thể đạt 1,4 m/s và xói lở 0,8 m/năm.", erosion:.8, velocity:1.4, qualifier:"Giá trị có thể xảy ra theo kết luận báo cáo"},
  {id:"con-bun", name:"Cồn Bùn", river:"Sông Cổ Chiên · Bến Tre", lon:106.315, lat:10.117, risk:"erosion", summary:"Báo cáo kết luận đây là một trong các vùng xói lở chiếm ưu thế; phần kết luận không nêu tốc độ định lượng riêng.", erosion:null, velocity:null},
  {id:"cu-lao-dat", name:"Cù lao Đất", river:"Nhánh sông khu vực Bến Tre", lon:106.431, lat:10.167, risk:"erosion", summary:"Xói lở chiếm ưu thế; báo cáo ghi nhận xói lở đầu cồn và xu hướng dịch chuyển về hạ lưu.", erosion:null, velocity:null},
  {id:"con-phung", name:"Cồn Phụng", river:"Sông Tiền · Châu Thành", lon:106.358, lat:10.342, risk:"stable", summary:"Báo cáo ghi nhận bồi tụ chiếm ưu thế, tương đối ổn định; là khu vực khai thác du lịch và nuôi cá lồng bè.", erosion:null, velocity:null},
  {id:"con-quy", name:"Cồn Quy", river:"Sông Tiền · Châu Thành", lon:106.393, lat:10.370, risk:"stable", summary:"Báo cáo ghi nhận bồi tụ chiếm ưu thế và xu hướng tương đối ổn định.", erosion:null, velocity:null},
  {id:"tan-my", name:"Cồn Tân Mỹ", river:"Sông Mỹ Tho · Bến Tre", lon:106.284, lat:10.392, risk:"watch", summary:"Khu vực phát triển nuôi cá lồng bè; báo cáo đề cập xói lở đáng lưu ý, không cung cấp mức xói riêng tại kết luận.", erosion:null, velocity:null}
];
const BIO = [
  {name:"Thực vật bậc cao",count:78,color:"#159c8d"},
  {name:"Cá",count:142,color:"#2b7fbc"},
  {name:"Thực vật phiêu sinh",count:166,color:"#84cbbd"},
  {name:"Động vật nổi",count:64,color:"#e0aa57"},
  {name:"Động vật đáy",count:45,color:"#7788b5"}
];
const RISK = {erosion:{label:"Xói lở",color:"#da634f"},stable:{label:"Ổn định / bồi",color:"#149e84"},watch:{label:"Theo dõi",color:"#d7a14c"}};
const byId = id => document.getElementById(id);
const state = {search:"", risk:"all", selected:null, map:null, ready:false, basemap:"light", showingSites:true, showingImported:true, showingWms:true, imported:{type:"FeatureCollection",features:[]},importName:"",wms:null,mode:"identify",measurePoints:[],measureValue:""};
const LIGHT_TILES = ["https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png","https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png","https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"];
const SAT_TILES = ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"];
const EMPTY = {type:"FeatureCollection",features:[]};
const PROVENANCE = "Điểm địa danh ước lượng chỉ phục vụ định hướng; không phải tọa độ khảo sát.";
function escapeHTML(v){return String(v===null||v===undefined?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function siteFeatures(){return {type:"FeatureCollection",features:SITES.map(s=>({type:"Feature",id:s.id,properties:{id:s.id,name:s.name,risk:s.risk,river:s.river,data_status:"place-reference-only",location_precision:"approximate"},geometry:{type:"Point",coordinates:[s.lon,s.lat]}}))};}
function mapStyle(){return {version:8, name:"Cồn GIS atlas",glyphs:"https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",sources:{basemap:{type:"raster",tiles:state.basemap==="light"?LIGHT_TILES:SAT_TILES,tileSize:256,attribution:state.basemap==="light"?"© OpenStreetMap contributors · © CARTO":"Imagery © Esri and contributors"}},layers:[{id:"basemap-layer",type:"raster",source:"basemap"}]};}
function reportStatus(msg, kind){const el=byId("map-status");el.textContent=msg;el.classList.toggle("error",kind==="error");}
function setNotice(id,msg,kind){const el=byId(id);el.textContent=msg;el.classList.remove("success","error");if(kind)el.classList.add(kind);}
function isLayer(id){return state.ready&&!!state.map.getLayer(id);}
function updateLayerVisibility(id,visible){if(isLayer(id))state.map.setLayoutProperty(id,"visibility",visible?"visible":"none");}
function makeMap(){
  if(typeof maplibregl==="undefined"){reportStatus("Không tải được MapLibre","error");return;}
  const map=state.map=new maplibregl.Map({container:"map",style:mapStyle(),center:[106.365,10.259],zoom:9.2,minZoom:4.5,maxZoom:18,attributionControl:true});
  map.addControl(new maplibregl.NavigationControl({showCompass:true,visualizePitch:false}),"bottom-right");
  map.addControl(new maplibregl.ScaleControl({maxWidth:110,unit:"metric"}),"bottom-left");
  map.on("style.load",()=>{
    try{setupLayers();state.ready=true;reportStatus("Bản đồ sẵn sàng");updateZoom();}catch(e){console.error(e);reportStatus("Lỗi khởi tạo lớp bản đồ","error");}
  });
  map.on("mousemove",e=>{byId("mouse-coordinates").textContent="WGS84 · "+e.lngLat.lat.toFixed(5)+"°N, "+e.lngLat.lng.toFixed(5)+"°E";});
  map.on("zoom",updateZoom);
  map.on("click",e=>{if(state.mode!=="identify")addMeasurePoint([e.lngLat.lng,e.lngLat.lat]);});
  map.on("dblclick",e=>{if(state.mode!=="identify"){e.preventDefault();finishMeasure();}});
  ["sites-circle","import-points","import-fill","import-lines"].forEach(id=>{
    map.on("click",id,e=>{if(state.mode!=="identify")return;if(id==="sites-circle"){const s=SITES.find(v=>v.id===e.features?.[0]?.properties?.id);if(s)selectSite(s.id,false);}else if(e.features?.length){selectImported(e.features[0],e.lngLat);}});
    map.on("mouseenter",id,()=>{if(state.mode==="identify")map.getCanvas().style.cursor="pointer";});
    map.on("mouseleave",id,()=>{map.getCanvas().style.cursor=state.mode==="identify"?"":"crosshair";});
  });
  map.on("error",err=>{console.warn("Map resource:",err.error?.message||err);});
}
function setupLayers(){
  const map=state.map;
  if(!map.getSource("study-sites"))map.addSource("study-sites",{type:"geojson",data:siteFeatures()});
  map.addLayer({id:"sites-halo",type:"circle",source:"study-sites",paint:{"circle-radius":14,"circle-color":["match",["get","risk"],"erosion","#da634f","stable","#149e84","#d7a14c"],"circle-opacity":.14,"circle-stroke-width":0},layout:{visibility:state.showingSites?"visible":"none"}});
  map.addLayer({id:"sites-circle",type:"circle",source:"study-sites",paint:{"circle-radius":6.5,"circle-color":["match",["get","risk"],"erosion","#da634f","stable","#149e84","#d7a14c"],"circle-stroke-color":"#ffffff","circle-stroke-width":2.3},layout:{visibility:state.showingSites?"visible":"none"}});
  map.addLayer({id:"sites-labels",type:"symbol",source:"study-sites",layout:{"text-field":["get","name"],"text-size":11,"text-font":["Open Sans Regular","Arial Unicode MS Regular"],"text-anchor":"left","text-offset":[1.25,0],"text-optional":true,"visibility":state.showingSites?"visible":"none"},paint:{"text-color":"#234956","text-halo-color":"#fff","text-halo-width":1.8}});
  if(!map.getSource("import-data"))map.addSource("import-data",{type:"geojson",data:state.imported});
  map.addLayer({id:"import-fill",type:"fill",source:"import-data",filter:["==",["geometry-type"],"Polygon"],paint:{"fill-color":"#2b82b0","fill-opacity":.26},layout:{visibility:state.showingImported?"visible":"none"}});
  map.addLayer({id:"import-lines",type:"line",source:"import-data",filter:["==",["geometry-type"],"LineString"],paint:{"line-color":"#2376ac","line-width":3},layout:{visibility:state.showingImported?"visible":"none"}});
  map.addLayer({id:"import-outline",type:"line",source:"import-data",filter:["==",["geometry-type"],"Polygon"],paint:{"line-color":"#1d739d","line-width":2},layout:{visibility:state.showingImported?"visible":"none"}});
  map.addLayer({id:"import-points",type:"circle",source:"import-data",filter:["==",["geometry-type"],"Point"],paint:{"circle-color":"#1e79b4","circle-radius":6,"circle-stroke-color":"#fff","circle-stroke-width":2},layout:{visibility:state.showingImported?"visible":"none"}});
  if(!map.getSource("measure-geojson"))map.addSource("measure-geojson",{type:"geojson",data:EMPTY});
  map.addLayer({id:"measure-fill",type:"fill",source:"measure-geojson",filter:["==",["geometry-type"],"Polygon"],paint:{"fill-color":"#20a18d","fill-opacity":.18}});
  map.addLayer({id:"measure-lines",type:"line",source:"measure-geojson",paint:{"line-color":"#12998a","line-width":3,"line-dasharray":[2,1]}});
  map.addLayer({id:"measure-vertices",type:"circle",source:"measure-geojson",filter:["==",["geometry-type"],"Point"],paint:{"circle-radius":4,"circle-color":"#0c847b","circle-stroke-width":2,"circle-stroke-color":"white"}});
  if(state.wms)attachWms();
  if(state.measurePoints.length)renderMeasurement();
}
function updateZoom(){if(state.map)byId("map-zoom").textContent="Z "+state.map.getZoom().toFixed(1);}
function setBasemap(kind){if(!state.map||kind===state.basemap)return;state.basemap=kind;byId("basemap-light").classList.toggle("active",kind==="light");byId("basemap-sat").classList.toggle("active",kind==="sat");state.ready=false;state.map.setStyle(mapStyle());}
function setSiteVisibility(on){state.showingSites=on;["sites-halo","sites-circle","sites-labels"].forEach(id=>updateLayerVisibility(id,on));}
function setImportedVisibility(on){state.showingImported=on;["import-fill","import-lines","import-outline","import-points"].forEach(id=>updateLayerVisibility(id,on));}
function setWmsVisibility(on){state.showingWms=on;updateLayerVisibility("ogc-wms",on);}
function renderSites(){
 const list=byId("site-list");list.replaceChildren();const q=state.search.toLocaleLowerCase("vi");
 const filtered=SITES.filter(s=>(state.risk==="all"||s.risk===state.risk||(state.risk==="stable"&&s.risk==="stable"))&&(s.name+" "+s.river).toLocaleLowerCase("vi").includes(q));
 byId("site-count").textContent=String(filtered.length).padStart(2,"0")+" khu vực";
 if(!filtered.length){const empty=document.createElement("div");empty.className="no-results";empty.textContent="Không tìm thấy địa danh phù hợp.";list.appendChild(empty);return;}
 filtered.forEach(s=>{
   const b=document.createElement("button");b.type="button";b.className="site-card"+(state.selected===s.id?" selected":"");b.setAttribute("aria-pressed",String(state.selected===s.id));
   b.innerHTML='<span class="site-icon" aria-hidden="true">≋</span><span class="site-main"><span class="site-line"><span class="site-name">'+escapeHTML(s.name)+'</span><span class="risk-badge '+s.risk+'">'+escapeHTML(RISK[s.risk].label)+'</span></span><span class="site-river">'+escapeHTML(s.river)+'</span></span>';
   b.addEventListener("click",()=>selectSite(s.id,true));list.appendChild(b);
 });
}
function detailRow(label,value){return '<div class="detail-row"><span>'+escapeHTML(label)+'</span><span>'+escapeHTML(value)+'</span></div>';}
function selectSite(id,fly){
 const s=SITES.find(v=>v.id===id);if(!s)return;state.selected=id;renderSites();
 const p=byId("feature-details");p.className="feature-details has-selection";
 p.innerHTML='<b>'+escapeHTML(s.name)+'</b><p>'+escapeHTML(s.summary)+'</p>'+detailRow("Diễn biến",RISK[s.risk].label)+detailRow("Sông / vùng",s.river)+(s.velocity!==null?detailRow("Vận tốc lớn nhất (mô hình)","≈ "+s.velocity+" m/s"):"")+(s.erosion!==null?detailRow("Xói lở có thể xảy ra",s.erosion+" m/năm"):"")+detailRow("Tọa độ trên bản đồ","Ước lượng minh họa")+detailRow("Nguồn","Báo cáo, tr. 251–253");
 if(fly&&state.map)state.map.flyTo({center:[s.lon,s.lat],zoom:12.3,duration:1100,essential:true});
 if(state.map&&state.ready&&state.mode==="identify"){
  const node=document.createElement("div");const title=document.createElement("div");title.className="popup-title";title.textContent=s.name;const msg=document.createElement("div");msg.className="popup-body";msg.textContent=s.summary+" "+PROVENANCE;node.append(title,msg);
  new maplibregl.Popup({offset:12,maxWidth:"300px"}).setLngLat([s.lon,s.lat]).setDOMContent(node).addTo(state.map);
 }
}
function selectImported(feature,lngLat){
 const props=feature.properties||{};const name=props.name||props.Name||props.Ten||props.id||"Đối tượng GeoJSON";
 const rows=Object.entries(props).slice(0,20).map(([k,v])=>detailRow(k,typeof v==="object"?JSON.stringify(v):v)).join("");
 const p=byId("feature-details");p.className="feature-details has-selection";p.innerHTML='<b>'+escapeHTML(name)+'</b><p>Dữ liệu người dùng nhập, không phải dữ liệu báo cáo.</p>'+rows;
 const n=document.createElement("div");const h=document.createElement("div");h.className="popup-title";h.textContent=String(name);const body=document.createElement("div");body.className="popup-body";body.textContent=Object.entries(props).slice(0,8).map(([k,v])=>k+": "+String(v)).join(" · ");n.append(h,body);
 new maplibregl.Popup({maxWidth:"300px"}).setLngLat(lngLat).setDOMContent(n).addTo(state.map);
}
function updateImported(data,name){
 if(!data||data.type!=="FeatureCollection"||!Array.isArray(data.features))throw new Error("Dữ liệu không phải GeoJSON FeatureCollection");
 const features=data.features.filter(f=>f&&f.type==="Feature"&&f.geometry&&f.geometry.type&&f.geometry.coordinates);
 if(features.length===0)throw new Error("Không tìm thấy đối tượng hình học hợp lệ");
 if(features.length>50000)throw new Error("Quá 50.000 đối tượng. Hãy chia dữ liệu hoặc xuất vector tile/PMTiles.");
 state.imported={type:"FeatureCollection",features};state.importName=name;byId("toggle-imported").checked=true;state.showingImported=true;
 if(state.ready){state.map.getSource("import-data").setData(state.imported);setImportedVisibility(true);}
 byId("import-layer-caption").textContent=name+" · "+features.length+" đối tượng";
 setNotice("import-message","Đã nạp "+features.length+" đối tượng từ "+name+". Dữ liệu được xử lý trong trình duyệt.","success");
 if(state.ready){try{const bbox=turf.bbox(state.imported);if(bbox.every(Number.isFinite)&&(bbox[2]-bbox[0])<90&&(bbox[3]-bbox[1])<70)state.map.fitBounds([[bbox[0],bbox[1]],[bbox[2],bbox[3]]],{padding:65,maxZoom:13,duration:800});}catch(e){console.warn("Cannot fit input extent",e);}}
}
function csvFeatures(content){
 if(typeof Papa==="undefined")throw new Error("Thư viện đọc CSV chưa tải. Hãy kiểm tra kết nối.");
 const parsed=Papa.parse(content.replace(/^\uFEFF/,""),{header:true,skipEmptyLines:true});
 if(parsed.errors.length&&parsed.data.length===0)throw new Error("CSV lỗi định dạng.");
 const names=parsed.meta.fields||[];const getField=(arr)=>names.find(k=>arr.includes(k.toLowerCase().replace(/[\s_-]+/g,"")));
 const lonKey=getField(["lon","lng","longitude","kinhdo","kinh do","x","long","longitude wgs84","kinh độ"]);
 const latKey=getField(["lat","latitude","vido","vi do","y","latitude wgs84","vĩ độ"]);
 if(!lonKey||!latKey)throw new Error("CSV cần cột lat/lon, latitude/longitude, kinhdo/vido hoặc x/y ở EPSG:4326.");
 const features=parsed.data.map((r,i)=>{const lon=Number(String(r[lonKey]??"").trim()),lat=Number(String(r[latKey]??"").trim());if(!Number.isFinite(lon)||!Number.isFinite(lat)||Math.abs(lat)>90||Math.abs(lon)>180||String(r[lonKey]??"").trim()===""||String(r[latKey]??"").trim()==="")return null;return {type:"Feature",id:i+1,properties:r,geometry:{type:"Point",coordinates:[lon,lat]}};}).filter(Boolean);
 if(!features.length)throw new Error("Không có tọa độ WGS84 hợp lệ. Kiểm tra EPSG:4326, cột và dấu thập phân.");
 return {type:"FeatureCollection",features};
}
async function handleFile(file){
 if(!file)return;try{
 const txt=await file.text();const isCsv=/\.csv$/i.test(file.name);let fc;
 if(isCsv)fc=csvFeatures(txt);else{let obj=JSON.parse(txt);if(obj.type==="FeatureCollection")fc=obj;else if(obj.type==="Feature")fc={type:"FeatureCollection",features:[obj]};else if(obj.type&&obj.coordinates)fc={type:"FeatureCollection",features:[{type:"Feature",properties:{},geometry:obj}]};else throw new Error("Không nhận diện GeoJSON hợp lệ.");}
 updateImported(fc,file.name);
 }catch(err){setNotice("import-message",err.message||"Không thể đọc tệp.","error");}
 byId("file-input").value="";
}
function downloadFile(name,body,mime){
 const blob=new Blob([body],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function getExportData(){return state.imported.features.length?state.imported:siteFeatures();}
function exportGeoJSON(){const obj=getExportData();downloadFile(state.imported.features.length?"congis-user-data.geojson":"congis-place-references-approximate.geojson",JSON.stringify(obj,null,2),"application/geo+json");}
function toCsv(rows){if(typeof Papa!=="undefined")return Papa.unparse(rows,{escapeFormulae:true});const quote=x=>'"'+String(x??"").replace(/"/g,'""')+'"';return rows.map(row=>row.map(quote).join(",")).join("\r\n");}
function exportCSV(){
 let rows;
 if(state.imported.features.length){const keys=[...new Set(state.imported.features.flatMap(f=>Object.keys(f.properties||{})))];rows=[["longitude","latitude",...keys],...state.imported.features.map(f=>{const coords=f.geometry.type==="Point"?f.geometry.coordinates:[null,null];return [coords[0],coords[1],...keys.map(k=>f.properties?.[k]??"")];})];}
 else rows=[["name","river","risk","longitude_approximate","latitude_approximate","erosion_m_per_year_report","velocity_m_per_sec_report","data_status"],...SITES.map(s=>[s.name,s.river,s.risk,s.lon,s.lat,s.erosion??"",s.velocity??"","place-reference-only"])];
 downloadFile(state.imported.features.length?"congis-user-data.csv":"congis-place-references-approximate.csv","\uFEFF"+toCsv(rows),"text/csv;charset=utf-8");
}
function connectWms(){
 const raw=byId("wms-url").value.trim(),layer=byId("wms-layer").value.trim();
 try{const u=new URL(raw);if(!["http:","https:"].includes(u.protocol))throw new Error("WMS phải có URL HTTP(S).");if(!/^[\p{L}\p{N}_.:-]+$/u.test(layer))throw new Error("Tên lớp WMS không hợp lệ.");
 state.wms={url:u.origin+u.pathname,layer};state.showingWms=true;byId("toggle-wms").checked=true;
 if(state.ready)attachWms();
 byId("wms-caption").textContent=layer;setNotice("wms-message","Đã cấu hình lớp "+layer+". Nếu trống, kiểm tra WMS, CORS, tên lớp và EPSG:3857.","success");
 }catch(err){setNotice("wms-message",err.message||"Lỗi WMS","error");}
}
function attachWms(){
 if(!state.wms||!state.map)return;
 const map=state.map;
 if(map.getLayer("ogc-wms"))map.removeLayer("ogc-wms");if(map.getSource("ogc-wms-source"))map.removeSource("ogc-wms-source");
 const sep=state.wms.url.includes("?")?"&":"?";
 const tile=state.wms.url+sep+"SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&LAYERS="+encodeURIComponent(state.wms.layer)+"&STYLES=&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}";
 map.addSource("ogc-wms-source",{type:"raster",tiles:[tile],tileSize:256});
 map.addLayer({id:"ogc-wms",type:"raster",source:"ogc-wms-source",paint:{"raster-opacity":.78},layout:{visibility:state.showingWms?"visible":"none"}},"sites-halo");
}
function setMode(mode){
 state.mode=mode;["identify","distance","area"].forEach(k=>byId("tool-"+k).classList.toggle("active",k===mode));
 const enabled=mode!=="identify";byId("measure-help").hidden=!enabled;
 byId("measure-title").textContent=mode==="distance"?"Đo chiều dài":"Đo diện tích";
 byId("measure-description").textContent="Nhấp để thêm đỉnh · nhấp đúp để kết thúc · Esc để xóa";
 if(state.map){if(enabled)state.map.doubleClickZoom.disable();else state.map.doubleClickZoom.enable();state.map.getCanvas().style.cursor=enabled?"crosshair":"";}
 if(!enabled)clearMeasurement();else clearMeasurement();
}
function addMeasurePoint(coord){
 state.measurePoints.push(coord);renderMeasurement();
}
function renderMeasurement(){
 if(!state.ready||!state.map?.getSource("measure-geojson"))return;
 const pts=state.measurePoints;const features=pts.map((c,i)=>({type:"Feature",properties:{order:i+1},geometry:{type:"Point",coordinates:c}}));
 try{
 if(pts.length>=2){features.push(turf.lineString(pts));if(state.mode==="distance"){const km=turf.length(turf.lineString(pts),{units:"kilometers"});state.measureValue=km>=1?km.toFixed(3)+" km":(km*1000).toFixed(1)+" m";}}
 if(pts.length>=3&&state.mode==="area"){const polygon=turf.polygon([[...pts,pts[0]]]);features.push(polygon);const km2=turf.area(polygon)/1e6;state.measureValue=km2>=1?km2.toFixed(3)+" km²":(km2*1e6).toFixed(1)+" m²";}
 const result=state.measureValue;byId("measure-description").textContent=(result?"Kết quả: "+result+" · ":"")+"Nhấp để thêm đỉnh · nhấp đúp để kết thúc";
 }catch(e){console.warn("Measure",e);}
 state.map.getSource("measure-geojson").setData({type:"FeatureCollection",features});
}
function finishMeasure(){if(state.mode==="identify")return;if(state.mode==="area"&&state.measurePoints.length<3)return;if(state.mode==="distance"&&state.measurePoints.length<2)return;renderMeasurement();}
function clearMeasurement(){state.measurePoints=[];state.measureValue="";if(state.ready&&state.map?.getSource("measure-geojson"))state.map.getSource("measure-geojson").setData(EMPTY);byId("measure-description").textContent="Nhấp để thêm đỉnh · nhấp đúp để kết thúc · Esc để xóa";}
function setUpCharts(){
 if(typeof Chart==="undefined")return;
 Chart.defaults.font.family="'Be Vietnam Pro',system-ui,sans-serif";Chart.defaults.color="#69828e";
 new Chart(byId("erosion-chart"),{type:"bar",data:{labels:["Cồn Phú Đa","Cồn Lác","Cù lao Tiên Lợi"],datasets:[{data:[2,1,.8],backgroundColor:["#d66551","#e5a065","#e9b89a"],borderRadius:6,barThickness:24}]},options:{indexAxis:"y",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>"Có thể đạt "+ctx.parsed.x+" m/năm (theo báo cáo)"}}},scales:{x:{beginAtZero:true,max:2.2,grid:{color:"#ebf0f2"},ticks:{font:{size:10}},title:{display:true,text:"m/năm"}},y:{grid:{display:false},ticks:{font:{size:10}}}}}});
 new Chart(byId("biodiversity-chart"),{type:"doughnut",data:{labels:BIO.map(d=>d.name),datasets:[{data:BIO.map(d=>d.count),backgroundColor:BIO.map(d=>d.color),borderWidth:4,borderColor:"#fff",hoverOffset:5}]},options:{cutout:"68%",responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>ctx.label+": "+ctx.parsed+" loài"}}}}});
 const legend=byId("biodiversity-legend");BIO.forEach(d=>{const row=document.createElement("div");row.className="bio-row";row.innerHTML='<i class="bio-swatch" style="background:'+d.color+'"></i><span>'+escapeHTML(d.name)+'</span><span class="bio-count">'+d.count+'</span>';legend.appendChild(row);});
}
function wire(){
 byId("site-search").addEventListener("input",e=>{state.search=e.target.value.trim();renderSites();});
 document.querySelectorAll("#risk-filter .filter").forEach(b=>b.addEventListener("click",()=>{state.risk=b.dataset.risk;document.querySelectorAll("#risk-filter .filter").forEach(v=>v.classList.toggle("active",v===b));renderSites();}));
 byId("reset-view").addEventListener("click",()=>state.map?.fitBounds([[106.04,10.04],[106.69,10.47]],{padding:45,duration:900}));
 byId("basemap-light").addEventListener("click",()=>setBasemap("light"));byId("basemap-sat").addEventListener("click",()=>setBasemap("sat"));
 byId("toggle-sites").addEventListener("change",e=>setSiteVisibility(e.target.checked));
 byId("toggle-imported").addEventListener("change",e=>setImportedVisibility(e.target.checked));
 byId("toggle-wms").addEventListener("change",e=>setWmsVisibility(e.target.checked));
 ["upload-data","tool-upload"].forEach(id=>byId(id).addEventListener("click",()=>byId("file-input").click()));
 byId("file-input").addEventListener("change",e=>handleFile(e.target.files?.[0]));
 byId("export-geojson").addEventListener("click",exportGeoJSON);byId("export-csv").addEventListener("click",exportCSV);
 byId("connect-wms").addEventListener("click",connectWms);
 ["identify","distance","area"].forEach(m=>byId("tool-"+m).addEventListener("click",()=>setMode(m)));
 byId("measure-clear").addEventListener("click",clearMeasurement);
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&state.mode!=="identify")clearMeasurement();});
 byId("tool-fullscreen").addEventListener("click",()=>{const el=document.querySelector(".map-stage");if(document.fullscreenElement)document.exitFullscreen();else if(el.requestFullscreen)el.requestFullscreen();});
 document.addEventListener("fullscreenchange",()=>{setTimeout(()=>state.map?.resize(),100);});
 byId("toggle-legend").addEventListener("click",()=>{const x=byId("legend-content");x.hidden=!x.hidden;byId("toggle-legend").textContent=x.hidden?"⌃":"⌄";});
 const dialog=byId("source-dialog");const open=()=>typeof dialog.showModal==="function"?dialog.showModal():dialog.setAttribute("open","");
 const close=()=>typeof dialog.close==="function"?dialog.close():dialog.removeAttribute("open");
 byId("show-provenance").addEventListener("click",open);byId("close-source").addEventListener("click",close);byId("ack-source").addEventListener("click",close);
}
document.addEventListener("DOMContentLoaded",()=>{renderSites();wire();makeMap();setUpCharts();});
