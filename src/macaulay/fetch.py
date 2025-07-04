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
        if species_code in fr_name_by_code:
            merged_data[species_code] = {
                "sciName": entry["sciName"],
                "comName": entry["comName"],
                "comNameFr": fr_name_by_code[species_code],
            }

    # Save merged dictionary to JSON file
    with open(
        "src/macaulay/ebird_taxonomy_merged_minimal.json", "w", encoding="utf-8"
    ) as f_out:
        json.dump(merged_data, f_out, ensure_ascii=False, indent=2)

    return merged_data


def download_species_lists(merged_data):
    api_token = "7lqpp8tk53jh"
    regions = ["US-CA", "CA-QC", "US-FL", "CA-BC"]
    base_url = "https://api.ebird.org/v2/product/spplist/{}"
    species_lists = {}

    for region in regions:
        url = base_url.format(region)
        region_data_raw = subprocess.check_output(
            f'curl -s -H "X-eBirdApiToken: {api_token}" "{url}"', shell=True
        )
        region_data = json.loads(region_data_raw)
        species_lists[region] = region_data

    # Include merged_data under the key "EARTH"
    species_lists["EARTH"] = list(merged_data.keys())

    # Save species lists to JSON file
    with open("src/macaulay/ebird_species_list.json", "w", encoding="utf-8") as f_out:
        json.dump(species_lists, f_out, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    merged = download_and_merge_taxonomy()
    download_species_lists(merged)
