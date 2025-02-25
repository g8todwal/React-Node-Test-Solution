import { useEffect, useState } from 'react';
import { DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react';
import { HasAccess } from '../../../redux/accessUtils';
import CommonCheckTable from '../../../components/reactTable/checktable';
import { SearchIcon } from "@chakra-ui/icons";
import { CiMenuKebab } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import AddMeeting from './components/Addmeeting';
import CommonDeleteModel from 'components/commonDeleteModel';
import { deleteManyApi, deleteApi } from 'services/api';
import { toast } from 'react-toastify';
import { fetchMeetingData } from '../../../redux/slices/meetingSlice';
import { useDispatch, useSelector } from 'react-redux';

const Index = () => {
    const title = "Meeting";
    const navigate = useNavigate();

    // Redux dispatch hook for triggering actions
    const dispatch = useDispatch();

     // Fetch meeting data from Redux store
    const { data = [], isLoading } = useSelector(state => state.meetingData);
   
    const [action, setAction] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedValues, setSelectedValues] = useState([]);
    const [advanceSearch, setAdvanceSearch] = useState(false);
    const [getTagValuesOutSide, setGetTagValuesOutside] = useState([]);
    const [searchboxOutside, setSearchboxOutside] = useState('');
    const user = JSON.parse(localStorage.getItem("user"));
    const [deleteMany, setDeleteMany] = useState(false);
    const [displaySearchData, setDisplaySearchData] = useState(false);
    const [searchedData, setSearchedData] = useState([]);
    const [permission] = HasAccess(['Meetings']);

    const actionHeader = {
        Header: "Action", isSortable: false, center: true,
        cell: ({ row }) => (
            <Text fontSize="md" fontWeight="900" textAlign={"center"}>
                <Menu isLazy>
                    <MenuButton><CiMenuKebab /></MenuButton>
                    <MenuList minW={'fit-content'} transform={"translate(1520px, 173px);"}>
                        {permission?.view && <MenuItem py={2.5} color={'green'}
                            onClick={() => navigate(`/metting/${row?.values._id}`)}
                            icon={<ViewIcon fontSize={15} />}>View</MenuItem>}
                        {permission?.delete && <MenuItem py={2.5} color={'red'} onClick={() => { setDeleteMany(true); setSelectedValues([row?.values?._id]); }} icon={<DeleteIcon fontSize={15} />}>Delete</MenuItem>}
                    </MenuList>
                </Menu>
            </Text>
        )
    };

    const tableColumns = [
        { Header: "#", accessor: "_id", isSortable: false, width: 10 },
        {
            Header: 'Agenda', accessor: 'agenda', cell: (cell) => (
                <Link to={`/metting/${cell?.row?.values._id}`}> 
                    <Text
                        me="10px"
                        sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}
                        color='brand.600'
                        fontSize="sm"
                        fontWeight="700"
                    >
                        {cell?.value || ' - '}
                    </Text>
                </Link>)
        },
        { Header: "Date & Time", accessor: "dateTime" },
        { Header: "Time Stamp", accessor: "timestamp" },
        { Header: "Create By", accessor: "createdByName" },
        ...(permission?.update || permission?.view || permission?.delete ? [actionHeader] : [])
    ];

    const handleDeleteMeeting = async (ids) => {
        try {
            const response = ids.length > 1
                ? await deleteManyApi('api/meeting/deleteMany', { ids })
                : await deleteApi('api/meeting/', ids[0]);

            if (response?.status === 200) {
                toast.success(`Deleted ${ids.length} meeting(s)`);
                setSelectedValues([]);
                setDeleteMany(false);
                dispatch(fetchMeetingData()); // Refetch data after deletion
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Delete failed');
        }
    };

    useEffect(() => {
        dispatch(fetchMeetingData()); // Dispatch Redux action to fetch meetings
    }, [dispatch, action]);

    return (
        <div>
            <CommonCheckTable
                title={title}
                isLoding={isLoading}
                columnData={tableColumns ?? []}
                allData={data ?? []}
                tableData={data}
                searchDisplay={displaySearchData}
                setSearchDisplay={setDisplaySearchData}
                searchedDataOut={searchedData}
                setSearchedDataOut={setSearchedData}
                tableCustomFields={[]}
                access={permission}
                onOpen={onOpen}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
                setDelete={setDeleteMany}
                AdvanceSearch={
                    <Button variant="outline" colorScheme='brand' leftIcon={<SearchIcon />} mt={{ sm: "5px", md: "0" }} size="sm" onClick={() => setAdvanceSearch(true)}>Advance Search</Button>
                }
                getTagValuesOutSide={getTagValuesOutSide}
                searchboxOutside={searchboxOutside}
                setGetTagValuesOutside={setGetTagValuesOutside}
                setSearchboxOutside={setSearchboxOutside}
                handleSearchType="MeetingSearch"
            />

            <MeetingAdvanceSearch
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                setSearchedData={setSearchedData}
                setDisplaySearchData={setDisplaySearchData}
                allData={data ?? []}
                setAction={setAction}
                setGetTagValues={setGetTagValuesOutside}
                setSearchbox={setSearchboxOutside}
            />
            <AddMeeting setAction={setAction} isOpen={isOpen} onClose={onClose} />

            {/* Delete model */}
            <CommonDeleteModel isOpen={deleteMany} onClose={() => setDeleteMany(false)} type='Meetings' handleDeleteData={handleDeleteMeeting} ids={selectedValues} />
        </div>
    );
};

export default Index;
