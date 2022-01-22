[
    {
        "id": 200,
        "condition": {
            "domains": ["www.amazon.co.jp"],
            "regexFilter": "/s.*[?&]rh=p_6%3AAN1VRQENFRJN5",
            "resourceTypes": ["main_frame"]
        },
        "action": {
            "type": "redirect",
            "redirect": {
                "transform": {
                    "queryTransform": {
                        "removeParams": ["rh"]
                    }
                }
            }
        }
    }
]