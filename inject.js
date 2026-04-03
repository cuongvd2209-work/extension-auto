let externalType = 'TRANSFER_PROCESSING';
const baseApiUrl = `https://qlvb-dev-api.pthub.vn/api`;
const pageSize = 1;
const enviroiment = {
  ASSIGN_TASK: {
    internalUrl: `https://quanlyvanban.hanoi.gov.vn/qlvbdh/main?externalType=ASSIGN_TASK&IzL1Dx9w5BxmCEtw5A9c6Bnb=CEt1CzAwJyHx4yjbTq9vCBtuTt9fCcPbUo..&IyLlCc5f5w5fCES.=DBnZTb9jTBnw6Q9d6Btl3z5f5BKl6B1a53W.&CyHg5BLw=::docId::&Do..=1&CyHg5BLwObPt=undefined&CBAkTA9f5o..=m2526`,
    postAnalysesApi: `${baseApiUrl}/analyses-multipart/async`,
    getAnalysesApi: `${baseApiUrl}/analyses-async`
  },
  TRANSFER_PROCESSING: {
    internalUrl: `https://quanlyvanban.hanoi.gov.vn/qlvbdh/main?externalType=TRANSFER_PROCESSING&externalDocId=::docId::&IzL1Dx9w5BxmCEtw5A9c6Bnb=CEt1CzAwJyHx4yjbTq9vCBtuTt9fCcPbUo..&IyLlCc5f5w5fCES.=DBny4Y9y4B1V4ctk3yPbCY9aDz5Y3yPbCY9fCcPbUo..&CBAkTA9f5o..=m2766&4c9lTFLwDctm=2&6yXl=VAN_BAN_DEN_CA_NHAN&Cc9m=20&TFbm5B5xCcLw6B9k=0`,
    postAnalysesApi: `${baseApiUrl}/analyses-multipart-lead/async`,
    getAnalysesApi: `${baseApiUrl}/analyses-lead-async`
  }
}
const filter = {
  "ma_dinh_danh": "",
  "trich_yeu": "",
  "kho": "VAN_BAN_DEN_CA_NHAN",
  "type": "",
  "vbchidao": "",
  "param_menu_congvan_dendi": "",
  "vanbannoibo": "",
  "hcm_q12_nobo": "",
  "type_vbden_choxuly": "",
  "typexuly": "",
  "trangthai_doc": "",
  "trong_ngay": "",
  "vbnoibo": "",
  "lanhdao": "",
  "trichyeukhongdau": "0",
  "ngay": "",
  "loai": "",
  "phieuchuyen": "",
  "loai_cqbh": "",
  "vaitro_user": "",
  "cohanxly": "",
  "hienthi_dsvb_blu": "qlvb/van_ban_den/dsvb_den/lst_table",
  "sel_year_search": "",
  "is_current_year": "",
  "in_dvbanhanh": "",
  "notin_dvbanhanh": "",
  "like_madinhdanh": "",
  "notlike_madinhdanh": "",
  "mailcv": "",
  "order_do_khan": "0",
  "order_vb_denhan": "0",
  "CONFIG_VBDEN_HIENTHI_COT_TTVANBAN": "0",
  "isConfigFuncHanchexem": "0",
  "vbtrongngoai": "",
  "view_vb_vanthu_chuyen": "0",
  "para_tooltip": "0"
}

// COMMON FUNCTION START
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function convertDate(date) {
  const d = new Date(date);
  const formatted = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")
    }/${d.getFullYear()}`;

  return formatted;
}

function toSlug(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/\s+/g, '')
    .toLowerCase();
}

function calcEndDate(startDate, addDate) {
  const d = new Date(startDate);
  d.setDate(d.getDate() + addDate);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}`;
}

function blobToFile(blob, fileName) {
  const file = new File([blob], fileName, {
    type: blob.type || 'application/octet-stream',
    lastModified: Date.now(),
  });

  return file;
}

function getPaging() {
  return new Promise((resolve) => {
    const url = `qlvb.van_ban_den.getVanBanDenPaging("-1","${pageSize}",'${JSON.stringify(filter)}')`;

    NEORemoting.getRSet(url, function (data) {
      try {
        resolve(JSON.parse(data));
      } catch (e) {
        console.error("Parse error:", e);
        resolve([]);
      }
    });
  });
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

async function getDocIds(page) {
  return new Promise((resolve) => {
    const url = `qlvb.van_ban_den.getDSVanBanDen("${page}","${pageSize}",'${JSON.stringify(filter)}')`;

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

async function getInformation(data) {
  if (data == null || data == '[]') {
    new Toast('error', Url.decode_1252('Không lấy được danh sách file đính kèm, vui lòng thử lại'));
    return ''
  } else {
    let fileName = '', file = '';
    try {
      let a = eval(data);
      let n = a.length;
      if (n > 0) {
        for (let i = 0; i < n; i++) {
          const f = a[i];
          if (f.is_phieu_trinh == '0') {
            fileName = f.name;
            if (fileName.toLowerCase().endsWith(".pdf")) {
              const blob = await getBlobData(f.hdd_file, fileName, 'vb');
              file = blobToFile(blob, fileName);

              return {
                success: true,
                file
              };
            }
          }
        }
        return {
          success: false,
          file
        }
      } else {
        new Toast('error', Url.decode_1252('Không có file đính kèm'));
      }
    } catch (e) {
      return {
        success: true,
        file
      }
    }
  }
}

function fillDate(element, date) {
  element.focus();
  element.value = convertDate(date);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.blur();
}

function getData(apiUrl) {
  return new Promise((resolve, reject) => {
    NEORemoting.getRSet(apiUrl, async function (res) {
      try {
        const information = await getInformation(res);

        if (information.success) {
          const jobId = await analyses(information.file);
          const data = await checkProcess(jobId);
          resolve(data);
        } else {
          resolve([]);
        }
      } catch (err) {
        reject(err);
      }
    });
  });
}
// COMMON FUNCTION END

// ASSIGN_TASK START
async function fillPriority(value) {
  const select = document.getElementById("cbPriority");

  if (!select) {
    console.log("Chưa thấy select cbPriority");
    return;
  }

  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

async function fillDeadline(date) {
  const deadline = document.getElementById("txtExpireDate");

  if (!deadline) {
    console.log("Chưa thấy input txtExpireDate");
    return;
  }

  fillDate(deadline, date)
}

async function fillDateToComplete(value) {
  const complete = document.getElementById("txtSoNgayThucHien");

  if (!complete) {
    console.log("Chưa thấy input txtSoNgayThucHien");
    return;
  }

  complete.value = value;
  complete.dispatchEvent(new Event("input", { bubbles: true }));
  complete.dispatchEvent(new Event("change", { bubbles: true }));
}

async function fillTitle(value) {
  const title = document.getElementById("txtMenuName");

  if (!title) {
    console.log("Chưa thấy input txtMenuName");
    return;
  }

  title.value = value;
  title.dispatchEvent(new Event("input", { bubbles: true }));
  title.dispatchEvent(new Event("change", { bubbles: true }));
}

async function fillDescription(text) {
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
}

async function fillUserTask(rows, task) {
  const userNameEl = rows.querySelector('td');

  for (let index = 0; index < task.users.length; index++) {
    const user = task.users[index];
    if (user.full_name == userNameEl.innerText) {
      const checkedClassName = user.main ? 'xlc' : (user.coordination ? 'ph' : 'td');
      rows.querySelector(`input.${checkedClassName}`).click();
      if (!user.monitor) {
        const ngayBatDauCV = rows.querySelector('input.ngayBatDauCV');
        fillDate(ngayBatDauCV, user.start_date)
        const ngayKetThucCV = rows.querySelector('input.ngayKetThucCV');
        fillDate(ngayKetThucCV, calcEndDate(user.start_date, task.date_to_complete))
      }

      await activeLog({
        action: "ASSIGN TASK",
        assign: user.full_name,
        pdf_name: task.title,
        response: "Task assigned successfully",
        task: `Start date: ${user.start_date}, End date: ${calcEndDate(user.start_date, task.date_to_complete)}`,
        type: "INFO"
      });
    }
  }
}

async function assignTask(task) {
  await fillTitle(task.title);
  await fillDescription(task.description);
  const table = document.getElementById('dt_basic_test');
  if (!table) return;
  const trUnit = table.querySelector("tr.trUnit");
  const tdUnit = trUnit.querySelector("td.tdUnit");
  tdUnit.click();
  await sleep(1000);
  const rows = [...table.querySelectorAll("tr")];
  const index = rows.indexOf(trUnit);

  for (let i = index + 1; i < rows.length; i++) {
    const el = rows[i];
    if (el.classList.contains("trEmp")) {
      await fillUserTask(el, task);
    }
  }
}
// ASSIGN_TASK END

// TRANSFER_PROCESSING START
async function fillTextArea(elementId, value) {
  const element = document.getElementById(elementId);

  if (!element) {
    console.log("Chưa thấy input txtThamMuu");
    return;
  }

  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

async function fillAutoAssign(value) {
  if (value) {
    const element = document.getElementById('chk_tudong_giaoviec');

    if (!element) {
      console.log("Chưa thấy input chk_tudong_giaoviec");
      return;
    }

    element.click();
  }
}

async function fillUserProcessing(users) {
  const table = document.getElementById('dt_ds_chuyentiep');
  if (!table) return;

  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const className = `treegrid-${toSlug(user.full_name)}_soxaydung`;
    const element = table.querySelector(`tr.${className}`);
    if (user.is_main_processor) {
      element.querySelector(`td.chutri`).click();
    }
    if (user.coordination_user) {
      element.querySelector(`td.userxl`).click();
    }
    if (user.view_user) {
      element.querySelector(`td.userxem`).click();
    }
  }
}
// TRANSFER_PROCESSING END

// CALL API FUNCTION START
async function getAccessToken() {
  const res = await fetch(`${baseApiUrl}/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({"username_or_email":"lehuuhong","password":"admin123"}),
  });
  const data = await res.json();
  localStorage.setItem("EXTERNAL_ACCESS_TOKEN", data.data.access_token);
}

async function activeLog(logAction) {
  const res = await fetch(`${baseApiUrl}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": localStorage.getItem("EXTERNAL_ACCESS_TOKEN")
    },
    body: JSON.stringify(logAction),
  });
  const data = await res.json();

  if (data.status_code == 401) {
    await getAccessToken();
    await activeLog(logAction);
  }
}

async function getAllDocIds() {
  return await getDocIds(1);
  const paging = await getPaging();
  if (!paging[0].nop) {
    return [];
  }

  const ids = [];

  for (let index = 1; index <= paging[0].nop; index++) {
    const pageIds = await getDocIds(index);
    ids.push(...pageIds);
  }

  return ids;
}

async function analyses(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(enviroiment[externalType]['postAnalysesApi'], {
    method: "POST",
    headers: {
      "Authorization": localStorage.getItem("EXTERNAL_ACCESS_TOKEN")
    },
    body: formData,
  });
  const data = await res.json();

  if (data.status_code == 401) {
    await getAccessToken();
    return await analyses(file);
  }

  return data.job_id;
}

async function checkProcess(jobId) {
  const res = await fetch(`${enviroiment[externalType]['getAnalysesApi']}/${jobId}`, {
    method: "GET",
    headers: {
      "Authorization": localStorage.getItem("EXTERNAL_ACCESS_TOKEN")
    },
  });
  const data = await res.json();

  if (data.status_code == 401) {
    await getAccessToken();
    return await checkProcess(jobId)
  }

  if (data.error) {
    return [];
  }

  if (!data.data) {
    await sleep(20000);
    console.log("Retry check process");

    return await checkProcess(jobId)
  }

  return data.data;
}
// CALL API FUNCTION END

// GOTO PAGE START
function gotoPage(docId) {
  window.location.href = enviroiment[externalType]['internalUrl'].replace("::docId::", docId);
}
// GOTO PAGE END

window.addEventListener("message", async (externalEvent) => {
  if (externalEvent.source !== window) return;

  if (externalEvent.data?.type === "RUN_OPEN_TAB") {
    localStorage.removeItem("ALL_DOC_IDS");
    localStorage.removeItem("EXTERNAL_ACCESS_TOKEN");
    await getAccessToken();
    await activeLog({
      action: "GET DOCUMENT TO PROCESS",
      assign: "N/A",
      pdf_name: "N/A",
      response: "N/A",
      task: "N/A",
      type: "INFO"
    });

    const docId = externalEvent.data.docId;
    const ids = docId ? [docId] : await getAllDocIds();

    localStorage.setItem("ALL_DOC_IDS", JSON.stringify(ids));
    gotoPage(ids[0]);
  }

  if (externalEvent.data?.action === "AUTO_FILL") {
    const docId = externalEvent.data.docId;
    externalType = externalEvent.data.type;
    const apiUrl = `qlvb.van_ban_den.getFileAttachLst("${docId}",0)`;
    const data = await getData(apiUrl);

    if (externalType === "ASSIGN_TASK") {
      await fillPriority(data.priority)
      await fillDeadline(data.deadline)
      await fillDateToComplete(data.date_to_complete)
      await sleep(3000);
      await assignTask(data.tasks[0]);
      const ids = JSON.parse(localStorage.getItem("ALL_DOC_IDS") || "[]");
      const currentIndex = ids.indexOf(docId);
      if (currentIndex >= 0 && currentIndex < ids.length - 1) {
        const nextDocId = ids[currentIndex + 1];
        gotoPage(nextDocId);
      }
    }

    if (externalType === "TRANSFER_PROCESSING") {
      const el = document.createElement('div');
      el.onclick = (e) => showDocDetail(docId, 'FALSE', '514357466', e);
      el.click();
      await sleep(1500);
      chuyenTiepVanBanV2(1);
      await sleep(1500);
      await fillTextArea('txtCommentChuyenTiep', data.processing_note);
      await fillTextArea('txtThamMuu', data.advisory_opinion);
      await fillAutoAssign(data.auto_assign);
      await fillUserProcessing(data.assignments);
    }
  }
});