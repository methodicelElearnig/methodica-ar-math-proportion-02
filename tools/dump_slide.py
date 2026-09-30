"""Full read of a slide: pictures, tables, and every paragraph with bold
markers and inline OMML fractions. The one dump to build a screen from."""
import sys, zipfile, xml.etree.ElementTree as ET
A='http://schemas.openxmlformats.org/drawingml/2006/main'
M='http://schemas.openxmlformats.org/officeDocument/2006/math'
R='http://schemas.openxmlformats.org/officeDocument/2006/relationships'
CHROME={'image4.png','image5.png','image3.png','image24.png'}
z=zipfile.ZipFile(sys.argv[1])
def frac(node):
    s=''
    for ch in node:
        t=ch.tag.split('}')[1]
        if t=='f':
            n=''.join(e.text or '' for e in ch.find(f'{{{M}}}num').iter(f'{{{M}}}t'))
            d=''.join(e.text or '' for e in ch.find(f'{{{M}}}den').iter(f'{{{M}}}t'))
            s+=f'❰{n}/{d}❱'
        elif t=='r': s+=''.join(e.text or '' for e in ch.iter(f'{{{M}}}t'))
        else: s+=frac(ch)
    return s
def para(p):
    out=''
    for node in list(p):
        t=node.tag.split('}')[1]
        if t=='r':
            rp=node.find(f'{{{A}}}rPr'); b=rp is not None and rp.get('b')=='1'
            u=rp is not None and rp.get('u') not in (None,'none')
            tx=''.join(e.text or '' for e in node.iter(f'{{{A}}}t'))
            if b: tx=f'**{tx}**'
            if u: tx=f'__{tx}__'
            out+=tx
        else:
            for m in node.iter(f'{{{M}}}oMath'): out+=frac(m)
    return out
for sl in [int(x) for x in sys.argv[2:]]:
    x=ET.fromstring(z.read(f'ppt/slides/slide{sl}.xml'))
    rels=ET.fromstring(z.read(f'ppt/slides/_rels/slide{sl}.xml.rels'))
    rmap={r.get('Id'):r.get('Target').split('/')[-1] for r in rels}
    print(f'════════════════ slide {sl} ════════════════')
    pics=[]
    for sp in x.iter():
        if sp.tag.split('}')[1]!='pic': continue
        b=sp.find(f'.//{{{A}}}blip'); f=rmap.get(b.get(f'{{{R}}}embed'),'?') if b is not None else '?'
        xf=sp.find(f'.//{{{A}}}xfrm'); 
        if xf is None or f in CHROME: continue
        o,e=xf.find(f'{{{A}}}off'),xf.find(f'{{{A}}}ext')
        pics.append(f'{f} ({int(o.get("x"))/12700:.0f},{int(o.get("y"))/12700:.0f}) {int(e.get("cx"))/12700:.0f}x{int(e.get("cy"))/12700:.0f}')
    print('  PICS:', '; '.join(pics) or 'none')
    for tb in x.iter(f'{{{A}}}tbl'):
        cols=[int(g.get('w'))/12700 for g in tb.iter(f'{{{A}}}gridCol')]
        # `a:tblPr rtl="1"` flips which end the FIRST cell renders at. Printing
        # a bare "L→R" for an rtl table misleads the reader into reversing
        # columns that an RTL HTML table already reproduces correctly.
        pr = tb.find(f'{{{A}}}tblPr')
        rtl = pr is not None and pr.get('rtl') == '1'
        order = 'first cell renders RIGHTMOST (tblPr rtl=1 — an RTL HTML table matches it as-is)' \
                if rtl else 'first cell renders LEFTMOST (no rtl flag — an RTL HTML table REVERSES it)'
        print(f'  TABLE widths={[round(c) for c in cols]}  |  {order}')
        for tr in tb.iter(f'{{{A}}}tr'):
            cells=[]
            for tc in tr.findall(f'{{{A}}}tc'):
                cells.append(' '.join(para(p) for p in tc.iter(f'{{{A}}}p')).strip())
            print('    | ' + ' | '.join(cells))
    seen=set()
    for sp in x.iter():
        if sp.tag.split('}')[1]!='sp': continue
        for p in sp.iter(f'{{{A}}}p'):
            t=para(p).strip()
            if t and t not in seen: seen.add(t); print('  '+t)
