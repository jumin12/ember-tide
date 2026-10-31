from pathlib import Path
import hashlib,json
r=Path(__file__).resolve().parents[2];o=r/'output/elyndor/pixellab-v34';read=lambda p:json.loads((o/p).read_text(encoding='utf-8'))
sha=hashlib.sha256((r/'index.html').read_bytes()).hexdigest();v=read('verification.json');c=read('comparison/provenance.json')
assert len(v['checks'])==14 and all(q['pass']for q in v['checks'])
assert v['sha256']==sha
assert c['pass'] and c['after']['sha256']==sha
proof={n:read(p)for n,p in {'lighting':'presentation/report.json','solarCycle':'sky/report.json','foliageVisibility':'foliage/report.json','waterReflections':'reflections/report.json','cutaways':'cutaway/report.json','atmosphere':'atmosphere/report.json','controls':'controls/report.json','menus':'interface/report.json','campaign':'campaign/report.json','performance':'performance/native.json','endurance':'endurance/report.json','deviceSizes':'devices/report.json'}.items()}
for n,p in proof.items():
 assert not p.get('errors')
 if 'sha256'in p:assert p['sha256']==sha
 if 'pass'in p:assert p['pass']
assert proof['campaign']['campaign']['final']=='complete'
p=r/'release.json';rel=json.loads(p.read_text(encoding='utf-8'));baseline=rel['validation'].get('previousWorldAudit') or {'release':rel['release'],'sha256':rel['artifact']['sha256'],'checks':rel['validation']['checks']}
rel.update(release='elyndor-alpha-1.9-lighting-refinement-2026-10-31-v34',artifact={'file':'index.html','bytes':(r/'index.html').stat().st_size,'sha256':sha,'offline':True},changes=['Authored continuous warm dawn and golden hour, bright cream daylight, violet dusk and blue moonlight with restrained local night lamps.','Reduced broad facade wash, strengthened sunlit botanical highlights and selective HDR bloom.','Moved the exploration camera closer, framed the party lower, and moved the desktop tutorial card aside so it does not cover the party.'])
rel['githubHistory']['previousRelease']='e062d2bbf9a9d1f8dc20b4d7eac4b832069094d5'
rel['graphics'].update(referenceLightingKeys=15,closerExplorationLensFactor=.84,explorationLookAheadMetres=7.2,localNightSpill=True,visualParityWithConcept=False)
rel['validation']={'gameplaySuite':v,'previousWorldAudit':baseline,**proof,'comparisons':c,'sourceMatchesArtifact':True}
rel['performance']={'nativeScenarios':proof['performance'],'extended1080p':proof['endurance'],'deviceSizes':proof['deviceSizes'],'scope':'Recorded native PC and emulated touch views. All 14 focused checks exercise the final standalone artifact, including the sun/moon horizon handoff and corrected desktop tutorial placement. Physical-phone frame rates and universal 60 FPS are not established.'}
p.write_text(json.dumps(rel,indent=2,ensure_ascii=False)+'\n',encoding='utf-8');print(json.dumps({'artifact':rel['artifact'],'gameplayChecks':14}))
