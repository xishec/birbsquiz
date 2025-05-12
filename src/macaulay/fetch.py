import subprocess
import json


def download_and_merge_taxonomy():
    api_token = "7lqpp8tk53jh"
    fr_url = "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=fr_CA"
    en_url = "https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json&locale=en_CA"

    # Download French taxonomy
    fr_data_raw = subprocess.check_output(
        f'curl -s -H "X-eBirdApiToken: {api_token}" "{fr_url}"', shell=True
    )
    fr_data = json.loads(fr_data_raw)

    # Download English taxonomy
    en_data_raw = subprocess.check_output(
        f'curl -s -H "X-eBirdApiToken: {api_token}" "{en_url}"', shell=True
    )
    en_data = json.loads(en_data_raw)

    # Map French common names by speciesCode
    fr_name_by_code = {entry["speciesCode"]: entry["comName"] for entry in fr_data}

    # Build the merged dictionary
    merged_data = {}
    for entry in en_data:
        species_code = entry.get("speciesCode")
        if species_code in fr_name_by_code and not species_code[-1].isdigit():
            merged_data[species_code] = {
                "sciName": entry["sciName"],
                "comName": entry["comName"],
                "comNameFr": fr_name_by_code[species_code],
            }

    # Save merged dictionary to JSON file
    with open("ebird_taxonomy_merged_minimal.json", "w", encoding="utf-8") as f_out:
        json.dump(merged_data, f_out, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    download_and_merge_taxonomy()
