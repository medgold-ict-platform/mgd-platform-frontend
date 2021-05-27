SEARCH_PATH=s3://dev-medgold-sharing/
BUCKET='dev-medgold-sharing'
METADATA_FIELD='Metadata.author'
METADATA_VALUE='alessandro.dellaquila'
KEY=$(aws s3 ls $SEARCH_PATH --recursive  | awk '{$1=$2=$3=""; print $0}' | sed 's/^[ \t]*//' | sort ) 
IFS=$'\n'
echo "" > selected.txt
while read -r CURRENT_KEY ;
do
    echo "processing: $CURRENT_KEY"
    SELECTED=`aws s3api head-object --bucket $BUCKET --key $CURRENT_KEY --query \"$METADATA_FIELD\" | grep $METADATA_VALUE`
    if [ ! -z $SELECTED ] 
    then
        echo "$CURRENT_KEY" >> selected.txt
        echo "$CURRENT_KEY has been selected"
    else
        echo "$CURRENT_KEY has NOT been selected"
    fi
done <<< "$KEY"

