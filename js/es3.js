$(document).ready(function(){

    $(".file-input-button").on("click", function() {
    	$("#file-input").click()
    });

    const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
        const byteCharacters = atob(b64Data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            const slice = byteCharacters.slice(offset, offset + sliceSize);

            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, {type: contentType});
        return blob;
    }
        
    $("#file-input").change(function(){

        var file = document.getElementById("file-input").files[0];
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onloadend = function(){

        	$("#docs").html("");

        	var dossierProfile = $(reader.result).find("es\\:DossierProfile")[0]
        	var dossierTitle = $(dossierProfile).find("es\\:Title").text()
        	var dossierECategory = $(dossierProfile).find("es\\:E-category").text()
        	var dossierCreationDate = $(dossierProfile).find("es\\:CreationDate").text()

        	$("#es3_title").text(dossierTitle)
        	$("#es3_nfo_date").text(dossierCreationDate)
        	$("#es3_nfo_type").text(dossierECategory)

            $.each($(reader.result).find("es\\:Document"), function(k, doc) {
	            
	            docProfile = $(doc).find("es\\:DocumentProfile")[0];
	            objRef = $(docProfile).attr("OBJREF")
	            title = $(docProfile).find("es\\:Title").text()
	            creationDate = $(docProfile).find("es\\:CreationDate").text()
	            sourceSizeValue = $(docProfile).find("es\\:SourceSize").attr("sizeValue")
	            sourceSizeUnit = $(docProfile).find("es\\:SourceSize").attr("sizeUnit")
	            mime = $(docProfile).find("es\\:Format es\\:MIME-Type").attr("type") + "/" + $(docProfile).find("es\\:Format es\\:MIME-Type").attr("subtype")

	            data = $(doc).find("ds\\:Object[Id*='" + objRef + "']").text()

	            baseTransform = $(doc).find("es\\:BaseTransform")[0];

	            console.log(title + ", " + creationDate + ", " + sourceSizeValue + " " + sourceSizeUnit)

	            transforms = ""
	            $.each($(baseTransform).find("es\\:Transform").get().reverse(), function(tk, transform) {
	            	if (transforms.length > 0) {
	            		transforms = transforms + "+"
	            	}
	            	transforms = transforms + $(transform).attr("Algorithm")
	            })

	            // --------------

                var doctemplate = 
                    $('#doctemplate')
                        .clone()
                        .removeClass("d-none")
                        .removeAttr("id");
                doctemplate.find(".doctitle").text(title);
                doctemplate.find(".docmime").text(mime);
                doctemplate.find(".docsize").text(sourceSizeValue + " " + sourceSizeUnit);
                doctemplate.find(".doctime").text(creationDate);

                img = "img/doc.svg";
                switch (mime) {
                    case "application/pdf":
                        img = "img/pdf.svg";
                        break;
                    case "text/plain":
                        img = "img/txt.svg";
                        break;
                }
                doctemplate.find(".dochead").prop("src", img);

	            switch (transforms) {
	            case "base64+zip":
                    {
    		            // console.log(transforms)
                        const contentType = 'application/zip';
                        const b64Data = data;

                        const blob = b64toBlob(b64Data, contentType);
                        const blobUrl = URL.createObjectURL(blob);

                        doctemplate.find(".docdl")
                            .removeClass("d-none")
                            .prop("href", blobUrl)
                            .prop("download", title + ".zip")
                    }
		        	break;
                case "base64": 
                    {
                        const contentType = mime;
                        const b64Data = data;

                        const blob = b64toBlob(b64Data, contentType);
                        const blobUrl = URL.createObjectURL(blob);

                        doctemplate.find(".docdl")
                            .removeClass("d-none")
                            .prop("href", blobUrl)
                            .prop("download", title)
                    }
                    break;
		        case "base64+encrypt+zip": 
		        	console.log("encrypted: " + transforms)

                    doctemplate.find(".docdl_enc")
                        .removeClass("d-none")                    

		        	break;                    
		        default:
		        	console.log("unk: " + transforms)
                    break;
		        }

                $("#docs").append(doctemplate);

	        })

	        $("#files_summ").text($(".doc_content").length - 1); // +1 is the template

            if ($(".doc_content").length == 1) {
                $("#docs").append(
                    $('#docemptytemplate')
                        .clone()
                        .removeClass("d-none")
                )
            }

	        $("#es3docs").removeClass("d-none");
            
            // ---------------------------------

            $("#es3sigs").addClass("d-none");
            $("#sigs").html("");

            $.each($(reader.result).find("ds\\:Signature"), function(k, sig) {

                var signatureProfile = $(sig).find("es\\:SignatureProfile")
                var signerName = $(signatureProfile).find("es\\:SignerName").text()

                // console.log(signerName)

                var qualifyingProperties = $(sig).find("QualifyingProperties")
                var signingTime = $(qualifyingProperties).find("SigningTime").text()

                // console.log(signingTime)

                var sigtemplate = 
                    $('#sigtemplate')
                        .clone()
                        .removeClass("d-none")
                        .removeAttr("id");
                sigtemplate.find(".signername").text(signerName);
                sigtemplate.find(".sigtime").text(signingTime);

                $("#sigs").append(sigtemplate);
            });

            if ($(".sig_content").length > 1) { // +1 is the template
                $("#es3sigs").removeClass("d-none");
            }
        };
    });
});
