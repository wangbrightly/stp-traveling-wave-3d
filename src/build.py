# 把 three.min.js、OrbitControls.js 和赞赏码图片内嵌进 HTML，产出可离线双击打开的单文件
# 用法：python3 build.py <源码.html> <three.min.js> <OrbitControls.js> <输出.html> [赞赏码.png]
import sys, pathlib, base64
src, three, orbit, out = map(pathlib.Path, sys.argv[1:5])
s = src.read_text(encoding='utf-8')
s = s.replace('/*__THREE__*/', three.read_text(encoding='utf-8')).replace('/*__ORBIT__*/', orbit.read_text(encoding='utf-8'))
if len(sys.argv) > 5:
    s = s.replace('__REWARD_DATAURI__', 'data:image/png;base64,' + base64.b64encode(pathlib.Path(sys.argv[5]).read_bytes()).decode())
out.write_text(s, encoding='utf-8'); print(out, out.stat().st_size, 'bytes')
