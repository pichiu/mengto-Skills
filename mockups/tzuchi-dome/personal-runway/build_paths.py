#!/usr/bin/env python3
"""Slice seat-lookup bundle.json into compact per-person 跑位動線 JSON.

Join key: "列-排|side" where side L=西, R=東 — the same identity the mockup
uses for a performer's base-formation seat (BLOCK-列-排 + 西/東 quadrant).

Output per person:
  { id, side, sideLabel, zone, area, costume,
    arena: {minx,miny,maxx,maxy},           # normalized footprint of formation 00
    steps: [ {code,name,order,kind,nx,ny,zone,area,ring,teach:[{name,canva,youtube}]} ] }
where kind = 'move' | 'hold' (inherited/停留原位) | 'home' (回基本隊形).
Coordinates are anchor-normalized: nx=(ix-cx)/r, ny=(iy-cy)/r  → shared frame.
"""
import json, sys, os

HERE = os.path.dirname(os.path.abspath(__file__))
# Usage: python build_paths.py [path/to/bundle.json] [path/to/out.json]
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "bundle.json")
OUT = sys.argv[2] if len(sys.argv) > 2 else os.path.join(HERE, "person_paths.json")

def zone_of(zone_map, sid, side):
    return zone_map.get(f"{sid}|{side}", {})

def teach_for_zone(teach_scene, zlabel):
    """Return teaching tracks relevant to my zone (西一/東一/西二/東二)."""
    out = []
    for tr in (teach_scene or {}).get("tracks", []):
        canva = youtube = None
        for mat in tr.get("mats", []):
            if zlabel in mat.get("zones", []):
                for on in mat.get("online", []):
                    if "canva.com" in on.get("url", ""):
                        canva = on["url"]
                for mp in mat.get("mp4", []):
                    if "youtu" in mp:
                        youtube = mp
        if canva or youtube:
            out.append({"name": tr.get("name"), "canva": canva, "youtube": youtube})
    return out

def build_person(b, sid, side):
    sc, zone_map, teach = b["scenes"], b["zone"], b.get("teach", {})
    scene_color = b.get("scene_color", {})
    seq, uniq = b["sequence"], set(b["unique"])
    def color_of(code):
        return scene_color.get(code) or scene_color.get(code.split("-")[0]) or "#7FA8D0"
    z0 = zone_of(zone_map, sid, side)
    # arena footprint: all formation-00 seats, normalized
    s00 = sc["00"]; a0 = s00["anchor"]
    xs = [(x["ix"] - a0["cx"]) / a0["r"] for x in s00["seats"]]
    ys = [(x["iy"] - a0["cy"]) / a0["r"] for x in s00["seats"]]
    arena = {"minx": min(xs), "miny": min(ys), "maxx": max(xs), "maxy": max(ys)}

    def own_pos(code):
        s = sc.get(code)
        if not s: return None
        hit = [x for x in s["seats"] if x["id"] == sid and x.get("side") == side]
        if not hit: return None
        h = hit[0]; a = s["anchor"]
        return {"nx": (h["ix"] - a["cx"]) / a["r"],
                "ny": (h["iy"] - a["cy"]) / a["r"],
                "ring": h.get("ring")}

    steps, order, last = [], 0, None
    for i, code in enumerate(seq):
        s = sc.get(code)
        if not s: continue
        order += 1
        pos = own_pos(code)
        is_home = (code == b.get("gate_ref", "00")) and i > 0
        if pos is None:  # inherited → hold previous position
            if last is None: continue
            kind = "hold"
            nx, ny, ring = last["nx"], last["ny"], last["ring"]
        else:
            nx, ny, ring = pos["nx"], pos["ny"], pos["ring"]
            kind = "home" if is_home else "move"
            last = {"nx": nx, "ny": ny, "ring": ring}
        z = zone_of(zone_map, sid, side)
        steps.append({
            "code": code, "name": s["name"], "order": order, "kind": kind,
            "color": color_of(code),
            "nx": round(nx, 3), "ny": round(ny, 3),
            "zone": z.get("z"), "area": z.get("a"), "ring": ring,
            "teach": teach_for_zone(teach.get(code), z.get("z", "")),
        })
    return {
        "id": sid, "side": side, "sideLabel": "西" if side == "L" else "東",
        "zone": z0.get("z"), "area": z0.get("a"),
        "arena": {k: round(v, 3) for k, v in arena.items()},
        "steps": steps,
    }

def main():
    b = json.load(open(SRC, encoding="utf-8"))
    # demo personas from the mockup seed
    targets = [("48-21", "L", "陳美玲"), ("12-18", "L", "黃志明")]
    people = {}
    for sid, side, name in targets:
        p = build_person(b, sid, side)
        p["name"] = name
        people[f"{sid}|{side}"] = p
    json.dump(people, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    # report
    for k, p in people.items():
        moves = sum(1 for s in p["steps"] if s["kind"] == "move")
        holds = sum(1 for s in p["steps"] if s["kind"] == "hold")
        print(f"{k} {p['name']}: {len(p['steps'])} steps ({moves} move / {holds} hold), zone {p['zone']}·{p['area']}")
    print("wrote", OUT, os.path.getsize(OUT), "bytes")

if __name__ == "__main__":
    main()
