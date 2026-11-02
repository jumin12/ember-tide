"""Trace the rendered current atlas; do not use its pixels as gameplay art."""
from pathlib import Path
from PIL import Image
import numpy as np, json, base64, heapq
from scipy.ndimage import gaussian_filter, binary_closing, binary_opening, binary_fill_holes, binary_dilation, distance_transform_edt, label
from skimage.morphology import skeletonize
from scipy.interpolate import CubicSpline
from scipy.spatial import cKDTree
from shapely.geometry import Polygon, box, Point
from shapely.ops import unary_union
from shapely import constrained_delaunay_triangles

ROOT=Path(__file__).resolve().parents[2];F=ROOT/'design/drive/atlas-nov01/atlas';w,h=768,432
im=Image.open(F/'terrain-composite-v38.png').convert('RGB').resize((w,h),Image.Resampling.BOX)
# The owner explicitly requested a detached volcanic island farther south.
# Move the entire regional silhouette, including its lakes and coastal shelves.
base=np.array(im); gy,gx=np.mgrid[:h,:w]
erase=(gx>w*.395)&(gx<w*.76)&(gy>h*.637+np.sin(gx*.11)*2.7)
base[erase]=[23,67,111]
island=Image.open(F/'detail-volcanic.png').convert('RGB').resize((round(700/2000*w),round(306/1125*h)),Image.Resampling.BOX)
ix,iy=round(775/2000*w),round(805/1125*h);tile=np.asarray(island);th,tw=tile.shape[:2]
base[iy:iy+th,ix:ix+tw]=tile[:min(th,h-iy),:min(tw,w-ix)]
im=Image.fromarray(base)
im.resize((1536,864)).save(F/'terrain-layout-v38.png')
a=np.asarray(im,dtype=float)/255;r,g,b=a[:,:,0],a[:,:,1],a[:,:,2];yy,xx=np.mgrid[:h,:w]
wet=(b>r*1.12)&(b>g*.91)&(b-r>.055)&(r<g*.73)&((np.max(a,axis=2)-np.min(a,axis=2))>.16)
land=binary_opening(binary_closing(~wet,iterations=1),iterations=1)
labels,n=label(land);sizes=np.bincount(labels.ravel());land=np.isin(labels,np.argsort(sizes[1:])[-32:]+1)
# Heal the source illustration's broad channels across the southern eastern
# continent. A closing of its real outline preserves coastal shape, unlike a
# rectangular fill. New narrow drainage is authored below, with one outlet.
old_land=land.copy();body_ids=label(land)[0];east_ids=[];volcanic_ids=[]
for body in np.unique(body_ids):
 if not body:continue
 by,bx=np.where(body_ids==body);cx,cy=float(bx.mean())/w,float(by.mean())/h
 if cx>.64 and cy<.73:east_ids.append(int(body))
 elif .38<cx<.76 and cy>.70:volcanic_ids.append(int(body))
east_body=np.isin(body_ids,east_ids);volcanic_body=np.isin(body_ids,volcanic_ids);western_body=land&~east_body&~volcanic_body
eastern=east_body;east_outline=binary_fill_holes(binary_closing(east_body,iterations=18))
healed=east_outline&~land&(distance_transform_edt(~volcanic_body)*2048/w>60);nearest=distance_transform_edt(~old_land,return_distances=False,return_indices=True)
a[healed]=a[nearest[0][healed],nearest[1][healed]];land|=healed;wet[healed]=False
r,g,b=a[:,:,0],a[:,:,1],a[:,:,2]
mass=binary_fill_holes(binary_closing(land,iterations=5));sea_labels,_=label(wet);source_ocean=sea_labels==sea_labels[0,0];fresh=wet&mass&~source_ocean
fresh=binary_closing(fresh,iterations=1);fresh=binary_opening(fresh,iterations=1)
fresh[east_outline|east_body]=False
# Preserve real lake basins; thin painted rivulets are reconstructed as curves.
lake_core=distance_transform_edt(fresh)>3;base_lakes=binary_dilation(lake_core,iterations=3)&fresh
fresh=base_lakes.copy()
drainage=[
 {'region':'desert','name':'Amber River','width':[4.2,7.5],'points':[[78.2,38.5],[77.8,40.8],[79.2,43.2],[80.6,47.5],[79.7,50.6],[80.8,52.2],[82.2,53.4],[81.6,55.5],[83.2,57.2],[84.2,59.8],[83.8,62],[84.4,64.2],[85.9,66.3],[85.5,68.1],[87.1,69.6],[88.2,72.1],[87.9,74],[89.8,76.9],[90.5,78.5]]},
 {'region':'desert','name':'Eastern tributary','width':[2.8,4.2],'points':[[92.5,45],[93,46.5],[91.5,48.3],[91.9,50.1],[90,51.6],[89.1,52.5],[89.6,54.2],[87.7,55.5],[88.2,57.1],[86.8,59],[87.1,60.5],[85.4,62.2],[84.4,64.2]]},
 {'region':'desert','name':'Western tributary','width':[2.8,4.2],'points':[[72,50],[73.1,50.9],[72.9,52.1],[74.3,53.1],[76,54],[76.9,55.7],[78.1,55.9],[78.4,57.2],[80,58],[81.4,57.9],[82.4,59],[84.2,59.8]]},
 {'region':'lush','name':'Valenne River','width':[4.4,8.2],'points':[[38.4,29.8],[37.6,31.7],[35.8,33],[34,34.5],[31.7,35.5],[31,37.6],[30.4,39.8],[29,42],[28.8,44],[29.1,46],[29.9,48.4],[31.6,49.8],[34,50.1],[36.2,50.7],[38.1,49.3],[39.8,47.9],[42.3,48.9],[44.5,49.8],[46.5,51.2],[48.6,53.5]]},
 {'region':'lush','name':'Brook River','width':[3.8,7.2],'points':[[18.5,49.7],[20,50.4],[21.9,50.9],[24,51],[25.4,51.7],[27.7,52.3],[29.8,53.1],[32,53.6],[33.7,54.5],[35.9,55.2],[37.5,56.6],[39.6,57.9],[42,58.4],[44.4,59.5],[45.6,60.1],[46.2,61.2],[47.0,65.0]]}
]
world_x=xx/w*2048-1024;world_z=yy/h*1152-576;new_channels=np.zeros((h,w),dtype=bool);curve_rows=[];channel_polygons=[]
for route in drainage:
 pts=np.array(route['points'],dtype=float)*[20.48,11.52]-[1024,576];t=np.r_[0,np.cumsum(np.linalg.norm(np.diff(pts,axis=0),axis=1))];ts=np.linspace(0,t[-1],max(50,int(t[-1]/2)))
 samples=CubicSpline(t,pts,bc_type='natural')(ts);tangents=np.gradient(samples,axis=0);tangents/=np.maximum(1e-9,np.linalg.norm(tangents,axis=1)[:,None]);normals=np.stack([-tangents[:,1],tangents[:,0]],axis=-1)
 bend=(np.sin(ts*.037)*1.3+np.sin(ts*.083+.4)*.5)*np.sin(np.linspace(0,np.pi,len(ts)))**2;samples+=normals*bend[:,None]
 progress=np.linspace(0,1,len(ts));head=np.clip(progress/.07,0,1);head=head*head*(3-2*head)
 widths=np.interp(progress,[0,1],route['width'])*(1+np.sin(ts*.11)*.07)*(.18+.82*head)
 left=samples+normals*(widths*(1+np.sin(ts*.073)*.055))[:,None];right=samples-normals*(widths*(1+np.cos(ts*.081)*.055))[:,None]
 channel_polygons.append(Polygon(np.vstack([left,right[::-1]])).buffer(0));curve_rows.append({'route':route,'points':samples,'widths':widths,'tangents':tangents})
 for i,p in enumerate(samples):
  radius=widths[i];new_channels|=(world_x-p[0])**2+(world_z-p[1])**2<radius**2
# A modest headwater oasis widens the river locally without bisecting the land.
new_channels|=((world_x-(80.6*20.48-1024))/14)**2+((world_z-(47.5*11.52-576))/10)**2<1
oasis=Point(80.6*20.48-1024,47.5*11.52-576).buffer(1,quad_segs=20)
from shapely.affinity import scale as polygon_scale
channel_polygons.append(polygon_scale(oasis,14,10,origin='center'))
fresh|=new_channels
shore=distance_transform_edt(land);water_radius=distance_transform_edt(fresh)
lum=.2126*r+.7152*g+.0722*b;sat=np.max(a,axis=2)-np.min(a,axis=2)
rock=gaussian_filter(np.clip((.28-sat)*4,0,1)*np.clip((lum-.19)*2.2,0,1),1.1)
coast=np.minimum(shore,18)*.45
upland=gaussian_filter(rock,3)*36+rock*40
snow_band=np.exp(-((xx-w*.285)/(w*.14))**2-((yy-h*.14)/(h*.14))**2)
volcano=np.exp(-((xx-w*.555)/(w*.035))**2-((yy-h*.765)/(h*.043))**2)*70+np.exp(-((xx-w*.625)/(w*.023))**2-((yy-h*.87)/(h*.03))**2)*42
height=3+coast+upland+snow_band*(8+rock*34)+volcano
height=np.where(land,np.minimum(height,2+shore*3.2),-5-np.minimum(distance_transform_edt(~land),18)*.3)
height=gaussian_filter(height,.65);height=np.where(height>0,height*1.65,height)
# Distances run along freshwater from the coast, so all branches share one
# surface elevation at a junction and gradually descend toward their outlets.
surface=np.full((h,w),np.inf);queue=[]
ocean=wet&~mass;near_ocean=distance_transform_edt(~ocean)
for y,x in zip(*np.where(fresh&(near_ocean<7))):surface[y,x]=0;heapq.heappush(queue,(0,y,x))
neighbors=[(-1,0,1),(1,0,1),(0,-1,1),(0,1,1),(-1,-1,1.414),(1,1,1.414),(-1,1,1.414),(1,-1,1.414)]
while queue:
 d,y,x=heapq.heappop(queue)
 if d!=surface[y,x]:continue
 for dy,dx,c in neighbors:
  ny,nx=y+dy,x+dx
  if 0<=ny<h and 0<=nx<w and fresh[ny,nx] and d+c<surface[ny,nx]:surface[ny,nx]=d+c;heapq.heappush(queue,(d+c,ny,nx))
water_level=np.where(np.isfinite(surface),np.minimum(surface*2048/w*.024,24)-1.4,np.maximum(1,gaussian_filter(np.maximum(height,0),5)-2))
water_level=np.where(fresh,water_level,0)
# Closed lakes have a single level; they must not inherit the painted highlights
# on the concept's water as undulating physical heights.
lake_labels,lake_n=label(fresh)
for lake in range(1,lake_n+1):
 region=lake_labels==lake
 if not np.isfinite(surface[region]).any():water_level[region]=max(.5,float(np.quantile(height[region],.15))-2)
# Analytic station heights keep narrow spring tips and tributary confluences
# smooth even where the coarse raster misses a sub-cell part of the channel.
for q in curve_rows:
 q['station']=np.r_[0,np.cumsum(np.linalg.norm(np.diff(q['points'],axis=0),axis=1))]
 if 'tributary' not in q['route']['name'].lower():q['levels']=-1.4+(q['station'][-1]-q['station'])*.012
for q in curve_rows:
 if 'levels' in q:continue
 main=next(v for v in curve_rows if v['route']['region']==q['route']['region'] and 'tributary' not in v['route']['name'].lower())
 confluence=np.linalg.norm(main['points']-q['points'][-1],axis=1).argmin()
 q['levels']=main['levels'][confluence]+(q['station'][-1]-q['station'])*.012
all_points=np.concatenate([q['points'] for q in curve_rows]);all_flow=np.concatenate([q['tangents'] for q in curve_rows]);all_levels=np.concatenate([q['levels'] for q in curve_rows]);all_widths=np.concatenate([q['widths'] for q in curve_rows]);tree=cKDTree(all_points)
grid_distance,grid_near=tree.query(np.stack([world_x.ravel(),world_z.ravel()],axis=-1));grid_near=grid_near.reshape(h,w);grid_distance=grid_distance.reshape(h,w)
water_level=np.where(fresh&(grid_distance<all_widths[grid_near]+4),all_levels[grid_near],water_level)
bank_distance,bank_index=distance_transform_edt(~fresh,return_indices=True);nearest_level=water_level[bank_index[0],bank_index[1]]
bank_blend=np.clip((bank_distance*2048/w-3)/27,0,1);bank_blend=bank_blend*bank_blend*(3-2*bank_blend)
graded=np.where(bank_distance*2048/w<30,(nearest_level-1.8)*(1-bank_blend)+height*bank_blend,height)
# A bank can lower the seafloor at a mouth, but must never dam or lift ocean.
height=np.where(land,graded,np.minimum(height,graded))
height=np.where(fresh,water_level-2.2,height)
water_world=np.where(water_level>0,water_level*1.25,water_level)
sk=skeletonize(fresh);pixels=set(zip(*np.where(sk)))
adj={p:[(p[0]+dy,p[1]+dx)for dy,dx,c in neighbors if(p[0]+dy,p[1]+dx)in pixels and not(dy and dx and ((p[0]+dy,p[1])in pixels or(p[0],p[1]+dx)in pixels))]for p in pixels}
ends={p for p,v in adj.items()if len(v)!=2};seen=set();paths=[]
for start in sorted(ends):
 for nxt in adj[start]:
  edge=tuple(sorted((start,nxt)))
  if edge in seen:continue
  seq=[start,nxt];seen.add(edge);previous,cur=start,nxt
  while cur not in ends:
   choices=[p for p in adj[cur]if p!=previous]
   if not choices:break
   p=choices[0];seen.add(tuple(sorted((cur,p))));seq.append(p);previous,cur=cur,p
  if len(seq)<5:continue
  points=[]
  for i,(y,x)in enumerate(seq):
   if i%2 and i!=len(seq)-1:continue
   points.append([round(x/w*2048-1024,3),round(y/h*1152-576,3),round(float(water_world[y,x]),3),round(max(1.2,float(water_radius[y,x])*2048/w*.9),3)])
  paths.append(points)
# Smooth geometric channel outlines are triangulated as one union, so tributary
# junctions have no overlapping transparent ribbons or square shoreline cells.
lake_boxes=[]
for y in range(h):
 row=base_lakes[y];starts=np.where(np.diff(np.r_[False,row,False].astype(int))==1)[0];ends=np.where(np.diff(np.r_[False,row,False].astype(int))==-1)[0]
 for x0,x1 in zip(starts,ends):lake_boxes.append(box(x0/w*2048-1024,y/h*1152-576,x1/w*2048-1024,(y+1)/h*1152-576))
lake_shape=unary_union(lake_boxes).simplify(.7,preserve_topology=True).buffer(.7,quad_segs=3).buffer(-.7,quad_segs=3)
water_shape=unary_union([lake_shape,*channel_polygons]).simplify(.22,preserve_topology=True)
triangles=constrained_delaunay_triangles(water_shape)
vertices=[];indices=[];lookup={}
for tri in triangles.geoms:
 ring=list(tri.exterior.coords)[:3]
 if (ring[1][0]-ring[0][0])*(ring[2][1]-ring[0][1])-(ring[1][1]-ring[0][1])*(ring[2][0]-ring[0][0])>0:ring=[ring[0],ring[2],ring[1]]
 for x,z in ring:
  key=(round(x,4),round(z,4))
  if key not in lookup:lookup[key]=len(vertices);vertices.append(key)
  indices.append(lookup[key])
coords=np.array(vertices);ix=np.clip(np.rint((coords[:,0]+1024)/2048*w).astype(int),0,w-1);iz=np.clip(np.rint((coords[:,1]+576)/1152*h).astype(int),0,h-1);ny=bank_index[0][iz,ix];nx=bank_index[1][iz,ix];levels=water_world[ny,nx]
distance,near=tree.query(coords);river_levels=np.where(all_levels[near]>0,all_levels[near]*1.25,all_levels[near]);levels=np.where(distance<all_widths[near]+3,river_levels,levels)
levels=np.where(source_ocean[iz,ix]&~land[iz,ix],-1.48,levels)
positions=np.stack([coords[:,0],levels+.035,coords[:,1]],axis=-1).astype('float32')
flow=all_flow[near].copy();flow[distance>16]=[.08,.12]
surface={'positions':base64.b64encode(positions.tobytes()).decode(),'indices':base64.b64encode(np.array(indices,dtype='uint32').tobytes()).decode(),'flow':base64.b64encode(flow.astype('float32').tobytes()).decode(),'vertices':len(vertices),'triangles':len(indices)//3}
# Exact centerline widths keep road bridges, navigation and banks in agreement.
curve_paths=[]
for q in curve_rows:
 points=[]
 for p,width,level in zip(q['points'],q['widths'],q['levels']):
  level=level*1.25 if level>0 else level;points.append([round(float(p[0]),3),round(float(p[1]),3),round(float(level),3),round(float(width),3)])
 curve_paths.append(points)
paths=curve_paths+[p for p in paths if all(tree.query([v[0],v[1]])[0]>16 for v in p)]
# The geometric paths carve their own matching bed after road grades are set.
# Climate is a spatial blend, not an ordinal stripe on the map. The east's
# scrubland becomes ochre foothills and then sand; snow follows exposed peaks
# and irregular treelines. Water separates the southern basalt island.
warp=np.sin(xx*.041+np.sin(yy*.027))*8+np.sin(xx*.097+yy*.031)*3.5
desert_t=np.clip((yy-(h*.46+warp)+h*.055)/(h*.11),0,1);desert_t=desert_t*desert_t*(3-2*desert_t)
distance_east=distance_transform_edt(~east_body);distance_volcanic=distance_transform_edt(~volcanic_body);distance_west=distance_transform_edt(~western_body);east=(distance_east<distance_volcanic)&(distance_east<distance_west)
snow_art=gaussian_filter(((r>.68)&(g>.7)&(b>.69)&(sat<.2)).astype(float),2.4)
snow_lat=np.clip((h*.35+warp*.55-yy)/(h*.13),0,1)
snow=np.clip((snow_art*.8+snow_band*.38)*snow_lat,0,1)*(~east)
volcanic=(distance_volcanic<distance_east)&(distance_volcanic<distance_west)
weights=np.stack([snow,east*(1-desert_t),east*desert_t,volcanic.astype(float)],axis=-1)
weights=np.maximum(0,weights);weights/=np.maximum(1,weights.sum(axis=-1,keepdims=True));weights[~mass]=0
lush=np.maximum(0,1-weights.sum(axis=-1));biome=np.argmax(np.concatenate([lush[...,None],weights],axis=-1),axis=-1).astype('uint8')
cw,ch=w//2,h//2
climate=np.uint8(np.rint(weights.reshape(ch,2,cw,2,4).mean(axis=(1,3))*255))
# Keep sub-metre samples while allowing substantially taller mountain relief.
scale=.7;encoded=np.clip(np.rint((height+16)/scale),0,255).astype('uint8')
payload={'w':w,'h':h,'scale':scale,'offset':-16,'source':'Current rendered atlas terrain layers, November 1, 2026','bytes':base64.b64encode(np.stack([encoded,biome],axis=-1).tobytes()).decode(),'climate':{'w':cw,'h':ch,'bytes':base64.b64encode(climate.tobytes()).decode()}}
(ROOT/'elyndor/relief-data-v18.js').write_text('// Current atlas coastline, snow transition and geographic relief.\nconst ATLAS_RELIEF18='+json.dumps(payload,separators=(',',':'))+';\n',encoding='utf-8')
water_bytes=np.stack([fresh.astype('uint8'),np.uint8(np.clip(np.rint((water_world+2)*2),0,255))],axis=-1)
bank=np.uint8(np.clip(bank_distance.reshape(ch,2,cw,2).mean(axis=(1,3))*2048/w/64*255,0,255))
hydro={'w':w,'h':h,'paths':paths,'surface':surface,'bank':{'w':cw,'h':ch,'bytes':base64.b64encode(bank.tobytes()).decode()},'water':base64.b64encode(water_bytes.tobytes()).decode(),'desertDrainage':{'routes':[q for q in drainage if q['region']=='desert'],'healedPixels':int(healed.sum()),'outlets':1,'oasis':[80.6,47.5],'source':'Owner-requested coherent drainage replacing the source illustration\'s broad cuts.'},'lushDrainage':{'routes':[q for q in drainage if q['region']=='lush'],'source':'Curves follow the reference valley and Brookstead waterworks before reaching the coastal bay.'},'source':'Atlas-aligned freshwater with continuous natural banks, connected water surfaces and sea-level outlets.'}
(ROOT/'elyndor/hydrology-v38.js').write_text('// Freshwater positions use actual overworld coordinates.\nconst ATLAS_HYDRO38='+json.dumps(hydro,separators=(',',':'))+';\n',encoding='utf-8')
colors=np.array([[109,147,68],[211,223,226],[141,127,105],[202,153,86],[100,96,83]])
preview=(colors[0]*lush[...,None]+(weights[...,None]*colors[1:]).sum(axis=2))*(.74+np.maximum(height,0)[...,None]/170);preview[~land]=[29,100,155];preview[fresh]=[77,175,200]
Image.fromarray(np.uint8(np.clip(preview,0,255))).resize((1536,864),Image.Resampling.NEAREST).save(F/'height-preview-v38.png')
print(json.dumps({'size':[w,h],'landPixels':int(land.sum()),'freshwaterPixels':int(fresh.sum()),'riverBranches':len(paths),'riverPoints':sum(map(len,paths)),'maximumHeight':float(height.max())}))
