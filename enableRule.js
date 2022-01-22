[
    {
        "id": 100,
        "condition": {
            "domains": ["www.amazon.co.jp"],
            "regexFilter": "/s.*[?&]k=",
            "resourceTypes": ["main_frame"]
        },
        "action": {
            "type": "redirect",
            "redirect": {
                "transform": {
                    "queryTransform": {
                        "addOrReplaceParams": [
                            {
                                "key": "rh",
                                "value": "p_6:AN1VRQENFRJN5"
                            }
                        ]
                    }
                }
            }
        }
    }
]
