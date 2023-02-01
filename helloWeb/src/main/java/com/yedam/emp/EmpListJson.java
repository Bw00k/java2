package com.yedam.emp;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.ServletInputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

@WebServlet("/empListJson")
public class EmpListJson extends HttpServlet {

	@Override
	protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		// 입력값의 한글처리
		req.setCharacterEncoding("utf-8");
		
		String parm = req.getParameter("param");
		String id = req.getParameter("id");
		String name = req.getParameter("name");
		String job = req.getParameter("job");
		String hire = req.getParameter("hire");
		String mail = req.getParameter("mail");

		EmpVO vo = new EmpVO();
		vo.setEmployeeId(Integer.parseInt(id));
		vo.setLastName(name);
		vo.setJobId(job);
		vo.setHireDate(hire);
		vo.setEmail(mail);

		EmpDAO dao = new EmpDAO();
		
		//param=update => DB update.
		//param=xxx => DB insert.
		if(parm.equals("update")) {
			if(dao.updateEmp(vo)>0) {
				resp.getWriter().print("{\"retCode\": \"Success\"}");
			}
			else {
				resp.getWriter().print("{\"retCode\": \"Fail\"}");
		}
		if (dao.addEmp(vo) > 0) {
			resp.getWriter().print("{\"retCode\": \"Success\"}");
		} else {
			resp.getWriter().print("{\"retCode\": \"Fail\"}");
		}
	}
	}

	// 제어의 역전(IOC);
	@Override
	protected void doDelete(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		String id = req.getParameter("del_id"); // 요청페이지에서 del_id로 파라미터 지정.

		//{id: 101, retCode: Success/Fail}
		Map<String, Object> map = new HashMap<>();
		map.put("id", id);

		EmpDAO dao = new EmpDAO();
		if (dao.deleteEmp(Integer.parseInt(id)) > 0) {
			// {"retCode": "Success"}
			//resp.getWriter().print("{\"retCode\": \"Success\"}");
			map.put("retCode", "Success");

		} else {
			// {"retCode": "Fail"}
			//resp.getWriter().print("{\"retCode\": \"Fail\"}");
			map.put("retCode", "Fail");
        }	
		// map => json
		Gson gson = new GsonBuilder().create();
		resp.getWriter().print(gson.toJson(map));
	}
	

	@Override
	protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
		resp.setCharacterEncoding("utf-8");
		resp.setContentType("text/json;charset=utf-8");

		EmpDAO dao = new EmpDAO();
		List<EmpVO> list = dao.empVoList();
		// [{"id": 100, "firstName": "Hong", "email": "HONG"....},{},{}]
		String json = "[";
		for (int i = 0; i < list.size(); i++) {
			json += "{\"id\":" + list.get(i).getEmployeeId() + //
					", \"firstName\": \"" + list.get(i).getFirstName() + //
					"\", \"lastName\": \"" + list.get(i).getLastName() + //
					"\", \"email\": \"" + list.get(i).getEmail() + //
					"\", \"hireDate\": \"" + list.get(i).getHireDate().substring(0, 10) + //
					"\", \"job\": \"" + list.get(i).getJobId() + //
					"\"}";
			if (i + 1 != list.size()) {
				json += ",";
			}
		}
		json += "]";

		resp.getWriter().print(json); // json포맷을 출력스트림으 전송.

	}

}
