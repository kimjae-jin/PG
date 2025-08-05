import pandas as pd
import os

# --- 설정 ---
SOURCE_FOLDER = "data_migration/invoices_source"
TARGET_SHEETS = ['세금계산서', '품목']

def scout_file_deep(filepath):
    """지정된 엑셀 파일의 모든 시트와 초기 데이터를 심층 정찰합니다."""
    try:
        print("\n" + "="*30)
        print(f"🕵️  심층 정찰 시작: {os.path.basename(filepath)}")
        print("="*30)

        # 1. 파일 내 모든 시트 이름 정찰
        xls = pd.ExcelFile(filepath)
        sheet_names = xls.sheet_names
        print("\n[발견된 모든 시트 이름]")
        print(sheet_names)
        print("-" * 25)

        # 2. 목표 시트들의 초기 데이터 정찰
        for sheet_name in sheet_names:
            # 우리가 목표로 하는 시트인지 확인 (부분 일치 포함)
            is_target = any(target in sheet_name for target in TARGET_SHEETS)
            if is_target:
                print(f"\n--- 시트 '{sheet_name}' 데이터 정찰 (처음 10행) ---")
                try:
                    # 헤더 없이 원본 그대로 읽어옵니다.
                    df = pd.read_excel(filepath, sheet_name=sheet_name, header=None)
                    # to_string()을 사용하여 모든 컬럼이 보이도록 출력
                    print(df.head(10).to_string())
                except Exception as e:
                    print(f"[!] 시트 '{sheet_name}' 데이터 읽기 중 오류: {e}")
                print("-" * (len(f"--- 시트 '{sheet_name}' 데이터 정찰 (처음 10행) ---")))


    except Exception as e:
        print(f"❌ 파일 '{os.path.basename(filepath)}'을 여는 데 실패했습니다: {e}")

def main():
    if not os.path.exists(SOURCE_FOLDER):
        print(f"❌ 오류: 원본 데이터 폴더 '{SOURCE_FOLDER}'를 찾을 수 없습니다.")
        return
        
    file_list = [f for f in os.listdir(SOURCE_FOLDER) if f.endswith(('.xlsx', '.xls'))]
    
    if not file_list:
        print("📂 정찰할 엑셀 파일이 없습니다.")
        return

    # 첫 번째 파일 하나만 심층 정찰합니다.
    scout_file_deep(os.path.join(SOURCE_FOLDER, file_list[0]))

if __name__ == "__main__":
    main()