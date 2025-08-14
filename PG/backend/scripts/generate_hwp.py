import sys
import json
import hwp5
import os

def main(template_path, output_path, data_string):
    """
    HWP 템플릿 파일에 JSON 데이터를 주입하여 새로운 HWP 파일을 생성합니다.
    Args:
        template_path (str): 원본 HWP 템플릿 파일 경로
        output_path (str): 결과물을 저장할 HWP 파일 경로
        data_string (str): 데이터가 담긴 JSON 문자열
    """
    try:
        # JSON 데이터 파싱
        data = json.loads(data_string)

        # HWP 템플릿 파일 열기
        hwp = hwp5.HWP5File(template_path)

        # 문서 내 모든 '누름틀'을 찾아 데이터로 교체
        # hwp5 라이브러리는 필드 이름으로 직접 접근하는 기능이 제한적이므로
        # 전체 텍스트를 순회하며 placeholder를 교체합니다.
        for section in hwp.body.sections:
            for para in section.paragraphs:
                # 단락의 텍스트를 직접 수정하는 것은 서식 문제를 유발할 수 있으므로
                # '누름틀' 객체를 직접 찾아 수정하는 방식을 시도합니다.
                # 이는 더 안정적입니다.
                if para.controls:
                    for ctrl in para.controls:
                        # 컨트롤이 '누름틀(field)' 타입인지 확인
                        if hasattr(ctrl, 'header') and ctrl.header.ctrl_id == b'gfn ' and hasattr(ctrl, 'content'):
                            # 누름틀의 이름(설명)이 placeholder 형식인지 확인
                            field_name = ctrl.content.field_name.strip('{}')
                            if field_name in data:
                                # 누름틀의 실제 텍스트 내용을 데이터로 교체
                                # 첫번째 텍스트 라인의 첫번째 run의 텍스트를 변경
                                if ctrl.content.text_lines and ctrl.content.text_lines[0].runs:
                                    ctrl.content.text_lines[0].runs[0].text = str(data[field_name])

        # 수정된 내용을 새로운 파일로 저장
        hwp.save(output_path)

        # 성공 시, 생성된 파일의 경로를 표준 출력으로 전달
        print(output_path)

    except Exception as e:
        # 실패 시, 에러 메시지를 표준 에러로 전달
        print(f"Error processing HWP file: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Node.js로부터 3개의 인자(template 경로, output 경로, JSON 데이터)를 받습니다.
    if len(sys.argv) != 4:
        print("Usage: python generate_hwp.py <template_path> <output_path> <json_data>", file=sys.stderr)
        sys.exit(1)

    template_file = sys.argv[1]
    output_file = sys.argv[2]
    json_data_arg = sys.argv[3]
    main(template_file, output_file, json_data_arg)