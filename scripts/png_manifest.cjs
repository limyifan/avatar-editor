// @ts-check
const path = require("path");
const fs = require("fs-extra");

const partsDir = path.resolve(__dirname, "../public/parts");

// const things = './public/parts/鞋/皮鞋.png ./public/parts/鞋/白球鞋.png ./public/parts/鞋/装饰皮鞋.png ./public/parts/人物.png ./public/parts/刘海/刘海.png ./public/parts/配件/披肩.png ./public/parts/配件/披风.png ./public/parts/鬓角/鬓角.png ./public/parts/裤子/工装裤.png ./public/parts/裤子/牛仔裤.png ./public/parts/裤子/猎装裤.png ./public/parts/配件/棒球帽.png ./public/parts/配件/渔夫帽.png ./public/parts/衣服/弹力西装.png ./public/parts/衣服/牛仔夹克.png ./public/parts/ 衣服/羽绒夹克.png ./public/parts/配件/斜挎胸包.png ./public/parts/衣服/长袖条纹T恤.png ./public/parts/裤子/弹力九分裤.png ./public/parts/裤子/牛仔喇叭裤.png ./public/parts/裤子/黑色运动裤.png ./public/parts/衣服/白色无袖背心.png ./public/parts/衣服/皮夹克白衬衣.png ./public/parts/衣服/蓝色连帽卫衣.png ./public/parts/裤子/灯芯绒九分裤.png ./public/parts/眼睛右.png ./public/parts/眼睛左.png ./public/parts/后面头发/后面头发.png ./public/parts/额外头发/额外头发.png'

/**
 * @param dir {string}
 * @return {Promise<string[]>}
 **/
async function getFiles(dir) {
  const subdirs = await fs.readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await fs.stat(res)).isDirectory() ? getFiles(res) : res;
    })
  );

  return files.flat().filter((f) => f.endsWith(".png"));
}

async function main() {
  const files = (await getFiles(partsDir)).map((f) => f.slice(f.indexOf("/parts/")));
  const manifestJson = {
    files,
  };
  fs.writeFile(path.resolve(partsDir, "manifest.json"), JSON.stringify(manifestJson, null, 2));
}

main();
