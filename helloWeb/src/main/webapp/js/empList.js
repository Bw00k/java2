/**
 *  empList.js
 */
// 목록출력하기
fetch("../empListJson")
  .then((resolve) => resolve.json())
  .then((result) => {
    result.forEach(function (item) {
      let tr = makeTr(item); //tr생성 후 반환

      // console.log(tr); //콘솔창으로 확인하기 위해서 넣음. 없어도 됨.
      list.append(tr); //tbody안에 데이터가 들어옴.
    }); // result 배열에 등록된 값의 개수만큼 for문 실행(배열에서 가능한 forEach 메소드 매개변수로 함수도 가능)
  })
  // 에러가 생기면 콜백함수로 확인
  .catch((reject) => {
    console.log(reject);
  });
// 저장버튼에 submit 이벤트 등록
document
  .querySelector('form[name="empForm"]')
  .addEventListener("submit", addMemberFunction);

//전체 선택 체크박스
document
  .querySelector('thead input[type="checkbox"]')
  .addEventListener("change", allCheckChange);

//선택 삭제 버튼.
document
  .querySelector("#delSelectedBtn")
  .addEventListener("click", delCheckedFnc);

// 데이터 한 건 활용해서 tr이라는 요소를 생성.
function makeTr(item) {
  //DOM 요소생성
  let titles = ["id", "lastName", "email", "hireDate", "job"]; //http://localhost:8081/helloWeb/empListJson에 컬럼 이름대로 가져오기
  //데이터 건수만큼 반복
  let tr = document.createElement("tr"); //데이터 한줄
  //columns 개수만큼 반복
  titles.forEach(function (title) {
    let td = document.createElement("td"); //칼럼
    td.innerText = item[title];
    tr.append(td); //td는 tr의 하위요소라서 append사용
  });
  //삭제. 하나의 row삭제
  let td = document.createElement("td");
  let btn = document.createElement("button");
  btn.innerText = "삭제";
  btn.addEventListener("click", deleteRowFunc);
  td.append(btn);
  tr.append(td);

  //수정
  td = document.createElement("td");
  btn = document.createElement("button");
  btn.innerText = "수정";
  btn.addEventListener("click", modifyTrFunc);
  td.append(btn);
  tr.append(td);

  //체크박스
  td = document.createElement("td");
  let chk = document.createElement("input");
  chk.setAttribute("type", "checkbox");
  td.append(chk);
  tr.append(td);
  // let checkBox = document.createElement("input");
  // checkBox.type = "checkbox";
  // td = document.createElement("td");
  // td.append(checkBox);
  // tr.append(td);

  //tr반환
  return tr;
}

// 삭제버튼 이벤트의 콜백함수.
function deleteRowFunc() {
  let id = this.parentElement.parentElement.firstChild.innerText; //이벤트대상은 btn 의 부모 tr 부모 td
  //del_id가 파라미터 이름
  fetch("../empListJson?del_id=" + id, {
    method: "DELETE",
  })
    .then((resolve) => resolve.json())
    .then((result) => {
      if (result.retCode == "Success") {
        alert("정상적으로 삭제");
        this.parentElement.parentElement.remove(); //이렇게 하면 db에서는 삭제하지만 브라우저상으로 지워지지 않음.
      } else if (result.retCode == "Fail") {
        alert("삭제 중 오류발생");
      }
    })
    .catch((reject) => {
      console.log(reject);
    });
}

//수정 처리 함수
function modifyTrFunc() {
  // this => 수정
  let thisTr = this.parentElement.parentElement;
  console.log("사원번호: ", thisTr.children[0].innerText);
  console.log("이름: ", thisTr.children[1].innerText);
  let id = thisTr.children[0].innerText;
  let name = thisTr.children[1].innerText;
  let mail = thisTr.children[2].innerText;
  let hire = thisTr.children[3].innerText;
  let job = thisTr.children[4].innerText;
  // 변경할 항목 배열에 등록.
  let modItems = [name, mail, hire, job];

  let newTr = document.createElement("tr");
  //사원번호 변경
  let td = document.createElement("td");
  td.innerText = id; //변경불가항목
  newTr.append(td);
  //각 아이템 별로 변경.
  modItems.forEach((item) => {
    td = document.createElement("td");
    let inp = document.createElement("input");
    inp.style = "width: 100px";
    inp.value = item;
    td.append(inp);
    newTr.append(td);
  });
  //삭제:비활성화, 변경: DB반영.
  let btn = document.createElement("button");
  btn.innerText = "삭제";
  btn.disabled = true;
  td = document.createElement("td");
  td.append(btn);
  newTr.append(td);

  //변경버튼
  btn = document.createElement("button");
  btn.innerText = "변경";
  btn.addEventListener("click", updateMemberFnc); //updateMemberFnc() 라고 ()실행코드를 넣어버리면 클릭안해도 실행해버림
  td = document.createElement("td");
  td.append(btn);
  newTr.append(td);

  thisTr.replaceWith(newTr);
}

//수정 처리 함수 안에서 업데이트 기능 함수.
function updateMemberFnc() {
  let currTr = this.parentElement.parentElement;
  let id = currTr.children[0].innerText; //사원번호
  let name = currTr.children[1].children[0].value; //td 안에 input 박스가 있어서 children 그리고 input은 value로 받아야 됨
  let mail = currTr.children[2].children[0].value;
  let hDate = currTr.children[3].children[0].value;
  let job = currTr.children[4].children[0].value;

  fetch("../empListJson", {
    method: "POST", //PUT이 안 되어서 POST 방식으로 등록을 했기때문에 param으로 구분
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:
      "param=update&id=" +
      id +
      "&name=" +
      name +
      "&mail=" +
      mail +
      "&hire=" +
      hDate +
      "&job=" +
      job,
  })
    .then((resolve) => resolve.text())
    .then((result) => {
      console.log(result);
      if (result.indexOf("Success") != -1) {
        // 변경값이 없으면 0이 나오지만 정상적으로 실행은 한 것은 맞기에 != -1을 넣음. 하나를 바꾸면 1 두개를 바꾸면 2
        //indexOf는 찾는 문자열이 없으면 -1이 나옴.
        alert("정상적으로 처리.");
        let newTr = makeTr({
          id: id,
          lastName: name,
          email: mail,
          hireDate: hDate,
          job: job,
        });
        currTr.replaceWith(newTr);
      } else {
        console.log("error 발생..");
      }
    })
    .catch((reject) => console.log(reject));
}

//저장 처리 함수
function addMemberFunction(evnt) {
  evnt.preventDefault(); //action이라는 속성이 정한 기본설정인 페이지 이동을 막기 위해
  console.log("여기에 출력");
  //'input[name=""]' 에 있는 ""안의 내용은 크롬에서 콘솔 창으로 칸 빈칸마다 name확인해서 넣는 것
  let id = document.querySelector('input[name="emp_id"]').value;
  let name = document.querySelector('input[name="last_name"]').value;
  let mail = document.querySelector('input[name="email"]').value;
  let hDate = document.querySelector('input[name="hire_date"]').value;
  let job = document.querySelector('input[name="job_id"]').value;
  //각각의 값들 하나라도 없으면(false)
  if (!id || !name || !mail || !hDate || !job) {
    alert("필수입력값을 확인!!");
    return;
  }

  //doPost
  fetch("../empListJson", {
    method: "Post",
    headers: { "Content-Type": "application/x-www-form-urlencoded" }, //파라미터로 key=val&key1=val1처럼 넘어감
    //첫번째 'id=' doPost 의 파라미터id 뒤의 id는 바로 위의 id 벨류
    body:
      "id=" +
      id +
      "&name=" +
      name +
      "&mail=" +
      mail +
      "&hire=" +
      hDate +
      "&job=" +
      job,
  })
    //=>가 하나 뿐이면 아래와 같이 생략 가능 .then(resolve => resolve.json())
    .then((resolve) => {
      return resolve.json();
    })
    .then((result) => {
      if (result.retCode == "Success") {
        alert("정상처리");
        //function makeTr(item){ 보고 : 앞에 넣기
        list.append(
          makeTr({
            id: id,
            lastName: name,
            email: mail,
            hireDate: hDate,
            job: job,
          })
        ); //오브젝트 타입으로 employee 정보를 넣으면 됨.
        //입력항목을 초기화.
        document.querySelector('input[name="emp_id"]').value = "";
        document.querySelector('input[name="last_name"]').value = "";
        document.querySelector('input[name="email"]').value = "";
        document.querySelector('input[name="hire_date"]').value = "";
        document.querySelector('input[name="job_id"]').value = "";

        list.get(i).getFirstName();
      } else if (result.retCode == "Fail") {
        alert("처리중 에러!");
      }
    });
}

//전체 선택 체크박스
function allCheckChange() {
  //이벤트 받는 대상 this
  console.log(this.checked);
  //tbody에 있는 체크박스 선택.
  //배열이라서 forEach 가능 chk의 checked라는 속성을 this.checked로 동기화
  document.querySelectorAll('tbody input[type="checkbox"]').forEach((chk) => {
    chk.checked = this.checked;
  });
}

//선택삭제 처리
function delCheckedFnc() {
  document
    .querySelectorAll('tbody input[type="checkbox"]:checked')
    .forEach((chk) => {
      fetch(
        "../empListJson?del_id=" + chk.closest("tr").children[0].innerText,
        {
          method: "DELETE",
        }
      )
        .then((resolve) => resolve.json())
        .then((result) => {
          if (result.retCode == "Success") {
            chk.closest("tr").remove(); //이렇게 하면 db에서는 삭제하지만 브라우저상으로 지워지지 않음.
            alert("정상적으로 삭제");
          } else if (result.retCode == "Fail") {
            alert("삭제 중 오류발생");
          }
        })
        .catch((reject) => {
          console.log(reject);
        });
    });
}
