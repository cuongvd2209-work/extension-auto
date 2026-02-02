const initURL = `https://quanlyvanban.hanoi.gov.vn/qlvbdh/main?IzL1Dx9w5BxmCEtw5A9c6Bnb=CEt1CzAwJyHx4yjbTq9vCBtuTt9fCcPbUo..&IyLlCc5f5w5fCES.=DBnZTb9jTBnw6Q9d6Btl3z5f5BKl6B1a53W.&CyHg5BLw=::docId::&Do..=1&CyHg5BLwObPt=undefined&CBAkTA9f5o..=m2526`

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractFlyIds(htmlString) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const rows = doc.querySelectorAll("#dt_basic tbody tr[flyid]");
  const ids = [];

  for (const row of rows) {
    ids.push(row.getAttribute("flyid"));
  }

  return ids;
}

function getAllDocIds(page = 1, pageSize = 10) {
  return new Promise((resolve) => {
    const filter = {
      "don_vi": "",
      "trich_yeu": "",
      "trich_yeu_org": "",
      "ma_duthao": "",
      "so_kyhieu": "",
      "so_kyhieu_org": "",
      "nguoixuly": "",
      "Kho_htvb": "",
      "nguoisoan": "",
      "nguoiky": "",
      "donvixuly": "",
      "dcm_type": "",
      "dcm_linhvuc": "",
      "dcm_priority": "",
      "dcm_confidential": "",
      "start_date_banhanh": "",
      "end_date_banhanh": "",
      "start_date_soanthao": "",
      "end_date_soanthao": "",
      "search_doc_id": "",
      "coquan_banhanh": "",
      "start_date_han_xuly": "",
      "end_date_han_xuly": "",
      "txt_toanvan": "",
      "dcm_sovanban_avs": "",
      "dcm_sovb_avs": "",
      "dcm_sovb_avs_range_dau": "",
      "dcm_sovb_avs_range_cuoi": "",
      "loai_vanban": "1",
      "loaitracuu": "",
      "avs_trangthaivanban_vbden": "",
      "chk_search_toanvan": "0",
      "condition": "",
      "conditionType": "",
      "qlvb_baocao_vbden_kynhan": "0",
      "hinhthucvb": "",
      "chk_search_chinhxac": "0",
      "txt_start_date_ngayden": "1/1/2026",
      "txt_end_date_ngayden": "31/12/2026",
      "fieldSort": "",
      "sort": "",
      "search_khongdau": "0",
      "doc_type": "",
      "is_read": "",
      "ioffice_number": "",
      "vanban_dientu_giay": "",
      "noi_nhan": "",
      "phanloai_vanban_luongxanh": "",
      "txt_tukhoa_any": "",
      "txt_nguoi_xlc": "",
      "vb_kyso": "",
      "doc_nam": "-1",
      "config_tim_kiem_chinh_xac_skh": "0",
      "TRACUU_VALIDATE_CONTROL": "0",
      "hinhthuc_chuyen": "",
      "xulychinh_cuoi": "",
      "sel_year_search": "",
      "is_current_year": "",
      "thu_tuc_hanh_chinh": "",
      "txt_ngay_hop": "",
      "txt_start_date_theoky": "",
      "txt_end_date_theoky": "",
      "isVBDungChung": "",
      "vt_tthc": "",
      "thuctuc_hsmc_id": null,
      "CONFIG_VBDEN_HIENTHI_COT_TTVANBAN": "0",
      "isConfigFuncHanchexem": "0",
      "para_tooltip": "0",
      "phanloaivb": ""
    }

    const url = `qlvb.van_ban_den.getDSVanBan("${page}","${pageSize}",'${JSON.stringify(filter)}')`;

    DataRemoting.getDoc(url, function (data) {
      try {
        const ids = extractFlyIds(data);
        resolve(ids);
      } catch (e) {
        console.error("Parse error:", e);
        resolve([]);
      }
    });
  });
}


function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

async function getBlobData(path, name, type) {
  if (!path.includes('upload/')) {
    path = Base64_Coder.encode(path);
  }

  const downloadUrl =
    "https://quanlyvanban.hanoi.gov.vn/qlvbdh/smartoffice/jbm/download.jsp" +
    "?5E1XCBS.=" + encodeURIComponent(Base64_Coder.encode(name)) +
    "&5FpXTEW.=" + path +
    "&TFbm5O..=" + Base64_Coder.encode(type);

  const res = await fetch(downloadUrl, {
    credentials: "include"
  });

  const blob = await res.blob();
  return blob;
}

async function getBase64Data(data) {
  if (data == null || data == '[]') {
    new Toast('error', Url.decode_1252('Không lấy được danh sách file đính kèm, vui lòng thử lại'));
    return ''
  } else {
    try {
      var a = eval(data);
      var n = a.length;
      if (n > 0) {
        for (var i = 0; i < n; i++) {
          const f = a[i];
          if (f.is_phieu_trinh == '0') {
            if (f.name.toLowerCase().endsWith(".pdf")) {
              const blob = await getBlobData(f.hdd_file, f.name, 'vb');
              const base64 = await blobToBase64(blob);
              return base64;
            }
          }
        }
        return ''
      } else {
        new Toast('error', Url.decode_1252('Không có file đính kèm'));
      }
    } catch (e) {
      console.log(e.message);
      return ''
    }
  }
}

async function fillCKEditor(text) {
  const iframe = document.querySelector("#cke_txtNoiDung iframe");

  if (!iframe) {
    console.log("Chưa thấy iframe CKEditor");
    return;
  }

  const body = iframe.contentDocument.body;

  body.innerHTML = `<p>${text}</p>`;

  body.dispatchEvent(new Event("input", { bubbles: true }));
  body.dispatchEvent(new Event("change", { bubbles: true }));

  const hidden = document.getElementById("txtNoiDung");
  if (hidden) hidden.value = text;

  console.log("Đã fill CKEditor");

}

window.addEventListener("message", async (event) => {
  if (event.source !== window) return;
  if (event.data?.type === "RUN_OPEN_TAB") {
    localStorage.removeItem("ALL_DOC_IDS");
    const ids = await getAllDocIds(1, 10)
    localStorage.setItem("ALL_DOC_IDS", JSON.stringify(ids));
    window.location.href = initURL.replace("::docId::", ids[0]);
  }

  if (event.data?.type === "FILL_FORM") {
    const docId = event.data.docId;
    const apiUrl = `qlvb.van_ban_den.getFileAttachLst("${docId}",0)`;

    NEORemoting.getRSet(apiUrl, async function (data) {
      const base64 = await getBase64Data(data);
      if (base64 != '') {
        //Call API
        const text = `Auto fill ${docId} \n Base64: ${base64}`;
        await fillCKEditor(text);
        await sleep(2000);
        const ids = JSON.parse(localStorage.getItem("ALL_DOC_IDS") || "[]");
        const currentIndex = ids.indexOf(docId);
        if (currentIndex >= 0 && currentIndex < ids.length - 1) {
          const nextDocId = ids[currentIndex + 1];
          window.location.href = initURL.replace("::docId::", nextDocId);
        }
      } else {
        console.log("No data");
      }
    });
  }
});